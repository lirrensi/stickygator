<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Factory\AppFactory;

require __DIR__ . '../vendor/autoload.php';
require __DIR__ . '../utils/jsonMiddleware.php';

require __DIR__ . '../db/db.php';
$db = Database::getInstance();

$app = AppFactory::create();
$app->add(new JsonBodyParserMiddleware());

const HEADER_USER_ID   = 'StickyUserId';
const HEADER_USER_PASS = 'StickyUserPass';
const APP_JSON         = 'application/json';

// Define an array of routes (by path) and/or methods to exclude
$excludeRoutes = [
    '/create_user' => ['POST'] // Exclude POST method for /create_user
];

// Middleware to apply for all methods, except the ones in $excludeRoutes
$middleware = function (Request $request, RequestHandler $handler) use ($app, $excludeRoutes, $db) {
    $route  = $request->getUri()->getPath(); // Get the current route path
    $method = $request->getMethod(); // Get the current HTTP method

    // echo "$route, $method";

    // If the current route and method are in the exclusion list, skip middleware
    if (isset($excludeRoutes[$route]) && in_array($method, $excludeRoutes[$route])) {
        // Proceed with the next middleware
        return $handler->handle($request);
    }

    // Get headers
    $userId = $request->getHeaderLine(HEADER_USER_ID); // Get user_id from header
    $pass   = $request->getHeaderLine(HEADER_USER_PASS); // Get pass from header

    // If either user_id or pass is missing, return error response
    if (!$userId || !$pass) {
        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write(json_encode(['error' => true, 'message' => 'Invalid input']));
        return $response->withHeader('Content-Type', APP_JSON)->withStatus(400);
    }

    // Check user authentication
    $is_auth = $db->checkAuth($userId, $pass);

    if (!$is_auth) {
        // Unauthorized access
        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write(json_encode(['error' => true, 'message' => 'Unauthorized']));
        return $response->withHeader('Content-Type', APP_JSON)->withStatus(401);
    }

    // Proceed to the next middleware/handler
    return $handler->handle($request);
};

// Add the middleware globally
$app->add($middleware);

$app->post('/create_user', function (Request $request, Response $response) use ($db) {
    // Parse request body as JSON
    $data = $request->getParsedBody();

    // echo "data: / " . var_dump($data);

    // Extract user_id and pass
    $userId = $data['user_id'] ?? null;
    $pass   = $data['pass'] ?? null;

    if (!$userId || !$pass) {
        // Return error if data is incomplete
        $response->getBody()->write(json_encode(['error' => true, 'message' => 'Invalid input / not json']));
        return $response->withHeader('Content-Type', APP_JSON)->withStatus(400);
    }

    try {
        $usr_created = $db->createUser($userId, $pass);
        // Return success response
        if ($usr_created) {
            $response->getBody()->write(json_encode(['error' => false, 'message' => 'User created']));

        } else {
            $response->getBody()->write(json_encode(['error' => true, 'message' => 'User NOT created']));
        }

        return $response->withHeader('Content-Type', APP_JSON);
    } catch (PDOException $e) {
        // Handle duplicate user or other pdo errors
        $response->getBody()->write(json_encode(['error' => true, 'message' => $e->getMessage()]));
        return $response->withHeader('Content-Type', APP_JSON)->withStatus(500);
    }
});

$app->get('/get_last_sync', function (Request $request, Response $response) use ($db) {
    // Extract user_id from the request headers
    $userId = $request->getHeader(HEADER_USER_ID)[0] ?? null;

    try {
        // Retrieve the last_sync time
        $lastSync = $db->getLastSync() ?? 0;

        $response->getBody()->write(json_encode(['error' => false, 'last_sync' => $lastSync]));

        return $response->withHeader('Content-Type', APP_JSON);
    } catch (PDOException $e) {
        // Handle database errors
        $response->getBody()->write(json_encode(['error' => true, 'message' => $e->getMessage()]));
        return $response->withHeader('Content-Type', APP_JSON)->withStatus(500);
    }
});

$app->get('/get_file', function (Request $request, Response $response) use ($pdo) {
    $userId = $request->getHeader(HEADER_USER_ID)[0] ?? null;

    $filePath = __DIR__ . "/blob/{$userId}.bin";
    $file     = null;
    if (file_exists($filePath)) {
        // Read and return the file as binary
        $file = file_get_contents($filePath);
    }
    if ($file !== null) {
        // Set the correct headers for binary file
        $response = $response
            ->withHeader('Content-Type', 'application/octet-stream')
            ->withHeader('Content-Disposition', 'attachment; filename="user_' . $userId . '.bin"')
            ->withHeader('Content-Length', strlen($file)); // Optional header for file size

        // Write the binary content to the response body
        $response->getBody()->write($file);
        return $response;

    } else {
        // Handle case when file is not found
        $response->getBody()->write(json_encode(['error' => true, 'message' => 'File not found']));
        return $response->withHeader('Content-Type', APP_JSON)->withStatus(404);

    }
});

$app->post('/put_file', function (Request $request, Response $response) use ($db) {
    $userId = $request->getHeader(HEADER_USER_ID)[0] ?? null;

    // Get uploaded files from the request
    $uploadedFiles = $request->getUploadedFiles();

    // Check if the 'file' key exists in the uploaded files
    if (empty($uploadedFiles['file'])) {
        return $response->withJson(['error' => true, 'message' => 'No file uploaded'], 400);
    }

    $uploadedFile = $uploadedFiles['file'];

    // Check for upload errors
    if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
        return $response->withJson(['error' => true, 'message' => 'File upload error'], 500);
    }

    // Define file path
    $filePath = __DIR__ . "/blob/{$userId}.bin";

    // Move the uploaded file to the correct location
    $stream      = $uploadedFile->getStream();
    $fileWritten = file_put_contents($filePath, $stream->getContents()) !== false;

    if ($fileWritten) {
        $db->setUserActivity(true, true);

        $response->getBody()->write(json_encode(['error' => false, 'message' => 'File uploaded successfully', 'file_name' => "{$userId}.bin"]));
        return $response->withHeader('Content-Type', APP_JSON);
    } else {
        $response->getBody()->write(json_encode(['error' => true, 'message' => 'File upload failed']));
        return $response->withHeader('Content-Type', APP_JSON)->withStatus(500);
    }
});

$app->get('/', function (Request $request, Response $response, $args) {
    $response->getBody()->write("whatcha u doin here? fook off mate");
    return $response;
});

$app->run();
