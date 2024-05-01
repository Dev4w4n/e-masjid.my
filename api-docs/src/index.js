import SwaggerUI from 'swagger-ui'
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from "swagger-ui-dist"
import 'swagger-ui/dist/swagger-ui.css';


const ui = SwaggerUI({
  urls: [
    { url: "http://localhost:8081/docs/doc.json", name: "Khairat-API" },
    { url: "http://localhost:8082/docs/doc.json", name: "Tabung-API" },
    { url: "http://localhost:8083/docs/doc.json", name: "Cadangan-API" },
    { url: "http://localhost:8084/docs/doc.json", name: "Cadangan-Public-API" },
    { url: "http://localhost:8085/docs/doc.json", name: "Tetapan-API" },
    { url: "http://localhost:8086/docs/doc.json", name: "Tetapan-Public-API" },
  ],
  dom_id: '#swagger',
  deepLinking: true,
  "urls.primaryName": "E-Masjid Service",
  presets: [
    SwaggerUIBundle.presets.apis,
    SwaggerUIStandalonePreset
  ],
  plugins: [
    SwaggerUIBundle.plugins.DownloadUrl
  ],
  layout: "StandaloneLayout"
});


ui.initOAuth({
  appName: "Swagger UI Multiple API Demo",
  clientId: 'implicit'
});
