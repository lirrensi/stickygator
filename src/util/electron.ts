// // source for electron only;

// // ADDED - Set userData path to the app directory
// // Set the path to the directory where the Electron app executable is located
// const appDir = path.dirname(app.getPath("exe"));
// const folderPathLocalResources = path.join(appDir, "local");
// if (!fs.existsSync(folderPathLocalResources)) {
//     fs.mkdirSync(folderPathLocalResources);
// }
// const folderPathUserData = path.join(appDir, "data");
// if (!fs.existsSync(folderPathUserData)) {
//     fs.mkdirSync(folderPathUserData);
// }
// // Set userData path to the app directory
// app.setPath("userData", folderPathLocalResources);
