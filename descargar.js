
/*

const { chromium } = require('playwright'); // Importa Playwright
const sqlite3 = require('sqlite3').verbose(); // Importa sqlite3
const fs = require('fs'); // Importa el módulo de sistema de archivos de Node.js

// Función para descargar la imagen usando fetch y crear un blob
async function fetchAndDownloadImage(page, imageUrl, imageName) {
  const imageResponse = await page.evaluate(async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }, imageUrl);

  const buffer = Buffer.from(imageResponse.split(',')[1], 'base64');
  fs.writeFileSync(`downloads/${imageName}`, buffer);
}

// Función asincrónica para descargar imágenes si son mayores a 250 píxeles
async function downloadImages() {
  // Conectar a la base de datos SQLite
  let db = new sqlite3.Database('./imagenes.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conectado a la base de datos.');
  });

  // Inicializar Playwright
  const browser = await chromium.launch({ headless: false }); // Usa la configuración de headless proporcionada en tu perfil
  const page = await browser.newPage();

  // Consulta para obtener todas las URLs de la columna src de la tabla images
  db.serialize(() => {
    db.each(`SELECT src FROM images`, async (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      const imageUrl = row.src;

      try {
        // Navegar a la URL de la imagen
        await page.goto(imageUrl, { waitUntil: 'load' });

        // Espera a que la página cargue completamente
        await new Promise((resolve) => setTimeout(resolve, 30000));

        // Obtener el tamaño de la imagen
        const dimensions = await page.evaluate(() => {
          const img = document.querySelector('img'); // Asumimos que hay una etiqueta img
          return {
            width: img.naturalWidth,
            height: img.naturalHeight,
            src: img.src
          };
        });

        // Descargar la imagen si cumple con el requisito de tamaño
        if (dimensions.width > 250 && dimensions.height > 250) {
          const imageName = imageUrl.split('/').pop();
          await fetchAndDownloadImage(page, imageUrl, imageName);
          console.log(`Descargada imagen de: ${imageUrl}`);
        }
      } catch (e) {
        console.error(`Error al navegar o descargar la imagen ${imageUrl}:`, e);
      }
    });
  });

  // Cerrar la base de datos
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('La conexión a la base de datos se ha cerrado.');
  });

  // Cerrar el navegador cuando todas las imágenes se hayan procesado
  await browser.close();
}

// Ejecutar la función
downloadImages();

*/


/*
const playwright = require('playwright');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fse = require('fs-extra');

async function descargador(dbPath, archiveName) {
  // Crear la conexión a la base de datos
  let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
      throw err; // Detiene la ejecución si no se puede conectar a la base de datos
    }
    console.log('Conectado a la base de datos.');
  });

  // Consultar las URLs de la base de datos
  db.all(`SELECT src FROM images`, async (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }

    // Extraer solo las URLs de las filas
    const urls = rows.map(row => row.src);

    // Definir la carpeta de descarga
    const downloadFolder = path.join(__dirname, archiveName);
    await fse.ensureDir(downloadFolder);

    // Configurar y lanzar el navegador
    const browser = await playwright.chromium.launch({
        headless: false,
      args: [
        '--window-size=1366,768',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
      ]
    });

    // Configurar el contexto para aceptar descargas
    const context = await browser.newContext({
      acceptDownloads: true,
      downloadsPath: downloadFolder
    });

    // Abrir una nueva página
    const page = await context.newPage();
    let imageIndex = 0;

    // Manejar el evento de descarga
    page.on('download', async (download) => {
      console.log("Evento de descarga detectado.");
      if (await download.failure()) {
        console.error(`Descarga fallida: ${await download.failure()}`);
        return;
      }

      const downloadPath = path.join(downloadFolder, `image-${imageIndex}.jpg`);
      try {
        await download.saveAs(downloadPath);
        imageIndex++;
      } catch (error) {
        console.error(`Error al guardar la descarga: ${error.message}`);
      }
    });

    // Navegar a cada URL y descargar la imagen
    for (let url of urls) {
      try {
        console.log(`Navegando a ${url}`);
        await page.goto(url, { waitUntil: 'load' });
        console.log('Ejecutando el script en la página.');

        // Aquí puedes ajustar el script para seleccionar y descargar específicamente la imagen que desees
        await page.evaluate(() => {
          const img = document.querySelector('img'); // Asumiendo que cada página tiene una etiqueta <img>
          if (img) {
            const anchor = document.createElement('a');
            anchor.href = img.src;
            anchor.download = `image-${imageIndex}.jpg`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
          }
        });

        // Esperar 3 segundos antes de la próxima descarga
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log(e);
      }
    }

    // Cerrar el navegador
    await browser.close();
    // Cerrar la base de datos
    db.close();
  });
};

// Uso de la función de descarga
descargador('./imagenes.db', 'downloaded_images');
*/

const playwright = require('playwright');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fse = require('fs-extra');

async function descargador (dbPath, archiveName) {
  // Crear la conexión a la base de datos
  let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
      throw err; // Detiene la ejecución si no se puede conectar a la base de datos
    }
    console.log('Conectado a la base de datos.');
  });

  // Consultar las URLs de la base de datos
  
  db.all(`SELECT src FROM images`, async (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }

/*
db.all(`SELECT href FROM media`, async (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
*/

    // Extraer solo las URLs de las filas
    const urls = rows.map(row => row.src);

    // Definir la carpeta de descarga
    const downloadFolder = path.join(__dirname, archiveName);
    await fse.ensureDir(downloadFolder);

    // Configurar y lanzar el navegador
    const browser = await playwright.chromium.launch({
        headless: false,
      args: [
        '--window-size=1366,768',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
      ]
    });

    // Configurar el contexto para aceptar descargas
    const context = await browser.newContext({
      acceptDownloads: true,
      downloadsPath: downloadFolder
    });

    // Abrir una nueva página
    const page = await context.newPage();
    let imageIndex = 0;

    // Manejar el evento de descarga
    page.on('download', async (download) => {
      console.log("Evento de descarga detectado.");
      if (await download.failure()) {
        console.error(`Descarga fallida: ${await download.failure()}`);
        return;
      }

      const downloadPath = path.join(downloadFolder, `image-${imageIndex}.jpg`);
      try {
        await download.saveAs(downloadPath);
        console.log(`Descarga completada: ${downloadPath}`);
        imageIndex++;
      } catch (error) {
        console.error(`Error al guardar la descarga: ${error.message}`);
      }
    });

    // Navegar a cada URL y descargar la imagen
    let contador = 0
    for (let url of urls) {
      try {

        console.log("descargado la imagen numero " + contador);
        contador++;
        console.log(`Navegando a ${url}`);
        await page.goto(url, { waitUntil: 'load' });
        console.log('Ejecutando el script en la página.');

        // Pasar `imageIndex` como un argumento a `page.evaluate()`
        await page.evaluate((index) => {
          const img = document.querySelector('img'); // Asumiendo que cada página tiene una etiqueta <img>
          if (img) {
            const anchor = document.createElement('a');
            anchor.href = img.src;
            anchor.download = `image-${index}.jpg`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
          }
        }, imageIndex); // Pasar la variable `imageIndex` aquí

        // Esperar 3 segundos antes de la próxima descarga
        await page.waitForTimeout(200);
      } catch (e) {
        console.error(e.message);
      }
    }

    // Cerrar el navegador
    await browser.close();
    // Cerrar la base de datos
    db.close();
  });
};

// Uso de la función de descarga
descargador('./images.db', 'downloaded_images');

