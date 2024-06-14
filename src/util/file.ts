export function makeDownloadFile(data: string, name: string, type: string = "application/json") {
    // Create a blob with the JSON string
    const blob = new Blob([data], { type });

    // Create a link element
    const a = document.createElement("a");
    a.style.display = "none";

    // Create a URL for the blob and set it as the href of the link
    const url = window.URL.createObjectURL(blob);
    a.href = url;

    // Set the filename for the download
    a.download = name;

    // Append the link to the body and click it programmatically
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
export async function parseJSONFile(file: File): Promise<{ [key: string]: any } | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                // Check if the file type is JSON
                if (file.type === "application/json") {
                    // Parse the JSON content
                    const result = event.target?.result;
                    if (result && typeof result === "string") {
                        const jsonData = JSON.parse(result);
                        resolve(jsonData);
                    } else {
                        resolve(null);
                    }
                } else {
                    reject(new Error('File is not of type "application/json"'));
                }
            } catch (error) {
                resolve(null);
                // reject(new Error("Error parsing JSON: " + error.message));
            }
        };

        // Read the file as text
        reader.readAsText(file);
    });
}
export async function manualImportFile() {
    return new Promise(async (resolve, reject) => {
        // Create an input element
        const input = document.createElement("input");
        input.type = "file";
        input.style.display = "none"; // Hide the input element

        // Listen for change event on the input element
        input.addEventListener("change", async (event: any) => {
            const selectedFile = event.target.files[0]; // Get the selected file
            // Do something with the selected file
            const parsedJson = await parseJSONFile(selectedFile);
            console.log("Selected file:", parsedJson);
            if (parsedJson) {
                resolve(parsedJson);
            } else resolve(null);
        });

        // Append the input element to the body
        document.body.appendChild(input);

        // Simulate a click on the input element
        input.click();
    });
}
