# React + Vite

Documentation: 

The application is named Prescription and Medication Intake Reminder, with the project name oxina-med-reminder. For the frontend, I used React with Vite, React Router DOM, and Axios. For the backend, I used Node.js and Express.js. The database is MongoDB with Mongoose. I also used utilities such as CORS, dotenv, and nodemon for development.

As a first step, I made sure that Node.js and MongoDB were installed and running locally on the standard port 27017. Next, I navigated to the backend folder from the project root and installed the packages by running cd backend, then npm install, and then cd .. to return to the root. After that, I navigated to the frontend folder from the project root and installed the packages by running cd frontend, then npm install, and then cd .. to return to the root.

Once all the required code was in place, I started the backend and frontend in two separate terminal windows. The backend starts on http://localhost:5000 and connects to MongoDB. The frontend runs on the Vite development server.




This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
