
/*
const { chromium } = require('playwright');
const rp = require('request-promise');
//const url = require('url');
const { URL } = require('url');

async function fetchRobotsTxt(website) {
    try {
        const content = await rp(`${website}/robots.txt`);
        return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
    } catch (error) {
        return [];
    }
}

async function webCrawling(website) {


    const browser = await chromium.launch({ headless: false});
    const page = await browser.newPage();
    const visited = new Set();
    const queue = [website];
    const disallowedPaths = await fetchRobotsTxt(website);
    const imgSrcs = [];

    const myURL = new URL(website);
    const websiteHostname = myURL.hostname;

    //const websiteHostname = url.parse(website).hostname;

    while (queue.length > 0) {
        try{
        const currentUrl = queue.shift();

        if (visited.has(currentUrl)) continue;
        if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

        visited.add(currentUrl);
        await page.goto(currentUrl, { waitUntil: "domcontentloaded" });

        const srcs = await page.$$eval('img', imgs => imgs.map(img => img.src));
        imgSrcs.push(...srcs);

        const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
        links.forEach(link => {
            if (url.parse(link).hostname === websiteHostname && !visited.has(link)) {
                queue.push(link);
            }
        });}catch(e){console.log(e)}
    }

    await browser.close();
    return imgSrcs;
}

webCrawling('https://mmdate.vip/forums').then(imgSrcs => {
    console.log('Imagenes encontradas:', imgSrcs);
});
*/
/*

const { chromium } = require('playwright');
const rp = require('request-promise');
const { URL } = require('url');

async function fetchRobotsTxt(website) {
    try {
        const content = await rp(`${website}/robots.txt`);
        return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
    } catch (error) {
        return [];
    }
}

async function webCrawling(website) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    const visited = new Set();
    const queue = [website];
    const disallowedPaths = await fetchRobotsTxt(website);
    const imgSrcs = [];

    const websiteURL = new URL(website);
    const websiteHostname = websiteURL.hostname;

    while (queue.length > 0) {
        const currentUrl = queue.shift();

        if (visited.has(currentUrl)) continue;
        if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

        visited.add(currentUrl);

        try {
            await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
            
            const srcs = await page.$$eval('img', imgs => imgs.map(img => img.src));
            imgSrcs.push(...srcs);

            const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
            links.forEach(link => {
                const linkHostname = new URL(link).hostname;
                if (linkHostname === websiteHostname && !visited.has(link)) {
                    queue.push(link);
                }
            });
        } catch (error) {
            console.log(`An error occurred: ${error}`);
        }
    }

    await browser.close();
    return imgSrcs;
}

webCrawling('https://mmdate.vip/forums').then(imgSrcs => {
    console.log('Imagenes encontradas:', imgSrcs);
});

*/

/*
const { chromium } = require('playwright');
const rp = require('request-promise');
const { URL } = require('url');
const sqlite3 = require('sqlite3').verbose();

const MAX_RETRIES = 1;

// Inicializa la base de datos
const db = new sqlite3.Database('./images.db');
db.run("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE, title TEXT)");

async function fetchRobotsTxt(website) {
  try {
    const content = await rp(`${website}/robots.txt`);
    return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
  } catch (error) {
    return [];
  }
}

async function webCrawling(website) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const visited = new Set();
  const queue = [website];
  const disallowedPaths = await fetchRobotsTxt(website);

  const websiteURL = new URL(website);
  const websiteHostname = websiteURL.hostname;

  while (queue.length > 0) {
    const currentUrl = queue.shift();

    if (visited.has(currentUrl)) continue;
    if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

    visited.add(currentUrl);

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('img'); // Espera a que las imágenes estén cargadas
        break; // Sal del bucle de reintentos si la navegación es exitosa
      } catch (error) {
        console.error(`Failed to navigate to ${currentUrl}: ${error}. Retrying (${i + 1}/${MAX_RETRIES})`);
      }
    }

    try {
      const imgInfo = await page.$$eval('img', imgs => imgs.map(img => ({ src: img.src, title: img.alt })));

      for (const { src, title } of imgInfo) {
        db.run("INSERT OR IGNORE INTO images (src, title) VALUES (?, ?)", [src, title]);
      }

      const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
      links.forEach(link => {
        const linkHostname = new URL(link).hostname;
        if (linkHostname === websiteHostname && !visited.has(link)) {
          queue.push(link);
        }
      });
    } catch (error) {
      console.error(`Failed to extract image information: ${error}`);
    }
  }

  await browser.close();
}

webCrawling('https://foro.laboutique.vip/').then(() => {
  console.log('Crawling terminado');
  db.close();
});
*/


/*

const { chromium } = require('playwright');
const rp = require('request-promise');
const { URL } = require('url');
const sqlite3 = require('sqlite3').verbose();

const MAX_RETRIES = 3;

// Inicializa la base de datos
const db = new sqlite3.Database('./media.db');
db.run("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE, title TEXT)");
db.run("CREATE TABLE IF NOT EXISTS videos (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE)");

async function fetchRobotsTxt(website) {
  try {
    const content = await rp(`${website}/robots.txt`);
    return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
  } catch (error) {
    return [];
  }
}



async function webCrawling(website) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const visited = new Set();
  const queue = [website];
  const disallowedPaths = await fetchRobotsTxt(website);

  const websiteURL = new URL(website);
  const websiteHostname = websiteURL.hostname;

  while (queue.length > 0) {
    const currentUrl = queue.shift();

    if (visited.has(currentUrl)) continue;
    if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

    visited.add(currentUrl);

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('img'); // Espera a que las imágenes estén cargadas
        break; // Sal del bucle de reintentos si la navegación es exitosa
      } catch (error) {
        console.error(`Failed to navigate to ${currentUrl}: ${error}. Retrying (${i + 1}/${MAX_RETRIES})`);
      }
    }

    try {
      const imgInfo = await page.$$eval('img', imgs => imgs.map(img => ({ src: img.src, title: img.alt })));
      for (const { src, title } of imgInfo) {
        db.run("INSERT OR IGNORE INTO images (src, title) VALUES (?, ?)", [src, title]);
      }

      // Captura elementos cuyo src termine en .mp4
      const videoSrcs = await page.$$eval('video', videos => videos.map(video => video.querySelector('source[src$=".mp4"]')).filter(Boolean).map(source => source.src));
      for (const src of videoSrcs) {
        db.run("INSERT OR IGNORE INTO videos (src) VALUES (?)", [src]);
      }

      const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
      links.forEach(link => {
        const linkHostname = new URL(link).hostname;
        if (linkHostname === websiteHostname && !visited.has(link)) {
          queue.push(link);
        }
      });
    } catch (error) {
      console.error(`Failed to extract image or video information: ${error}`);
    }
  }

  await browser.close();
}

webCrawling('https://mmdate.vip/forums').then(() => {
  console.log('Crawling terminado');
  db.close();
});

*/


/*

const { chromium } = require('playwright');
const rp = require('request-promise');
const { URL } = require('url');
const sqlite3 = require('sqlite3').verbose();

const MAX_RETRIES = 1;
const IMAGE_FORMATS = ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'];

// Inicializa la base de datos
const db = new sqlite3.Database('./media.db');
db.run("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE, title TEXT)");
db.run("CREATE TABLE IF NOT EXISTS videos (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE)");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchRobotsTxt(website) {
  try {
    const content = await rp(`${website}/robots.txt`);
    return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
  } catch (error) {
    return [];
  }
}

async function webCrawling(website) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const visited = new Set();
  const queue = [website];
  const disallowedPaths = await fetchRobotsTxt(website);

  const websiteURL = new URL(website);
  const websiteHostname = websiteURL.hostname;


  let contador = 0
  while (queue.length > 0) {

    contador++
    console.log(`empezando y queoue es igual a  ${queue.length} y el numero de veces redireccionado an sido ${contador}`)
    const currentUrl = queue.shift();

    if (visited.has(currentUrl)) continue;
    if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

    visited.add(currentUrl);

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {

        console.log(`empezando redireccion numnero ${i}`)
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('img'); // Espera a que las imágenes estén cargadas
        break; // Sal del bucle de reintentos si la navegación es exitosa
      } catch (error) {
        console.error(`Failed to navigate to ${currentUrl}: ${error}. Retrying (${i + 1}/${MAX_RETRIES})`);
        if (i < MAX_RETRIES - 1) {
          await Promise.race([sleep(5500), page.waitForSelector('img')]); // Espera 10 segundos o hasta que las imágenes estén cargadas
        }
      }
    }

    try {
      const imgInfo = await page.$$eval('img', imgs => imgs.map(img => ({ src: img.src, title: img.alt })));
      for (const { src, title } of imgInfo) {
        db.run("INSERT OR IGNORE INTO images (src, title) VALUES (?, ?)", [src, title]);
      }

      const videoSrcs = await page.$$eval('video', videos => videos.map(video => video.querySelector('source[src$=".mp4"]')).filter(Boolean).map(source => source.src));
      for (const src of videoSrcs) {
        db.run("INSERT OR IGNORE INTO videos (src) VALUES (?)", [src]);
      }

      const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
      links.forEach(link => {
        const linkURL = new URL(link);
        const linkHostname = linkURL.hostname;
        const linkPath = linkURL.pathname.toLowerCase();

        if (IMAGE_FORMATS.some(ext => linkPath.endsWith(ext))) {
          db.run("INSERT OR IGNORE INTO images (src, title) VALUES (?, ?)", [link, '']);
        }

        if (linkHostname === websiteHostname && !visited.has(link)) {
          queue.push(link);
        }
      });
    } catch (error) {
      console.error(`Failed to extract image or video information: ${error}`);
    }
  }

  await browser.close();
}

webCrawling('https://mmdate.vip/forums').then(() => {
  console.log('Crawling terminado');
  db.close();
});




*/


/*
const { chromium } = require('playwright');
const rp = require('request-promise');
const { URL } = require('url');
const sqlite3 = require('sqlite3').verbose();

const MAX_RETRIES = 1;

// Initialize the database
const db = new sqlite3.Database('./media.db');
db.run("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE, title TEXT)");
db.run("CREATE TABLE IF NOT EXISTS videos (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE)");

async function fetchRobotsTxt(website) {
  try {
    const content = await rp(`${website}/robots.txt`);
    return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
  } catch (error) {
    return [];
  }
}

async function webCrawling(website) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const visited = new Set();
  const queue = [website];
  const disallowedPaths = await fetchRobotsTxt(website);

  const websiteURL = new URL(website);
  const websiteHostname = websiteURL.hostname;



  let contador = 0
  while (queue.length > 0) {
    contador++
    console.log(`empezando y queoue es igual a  ${queue.length} y el numero de veces redireccionado an sido ${contador}`)
    const currentUrl = queue.shift();
    
    if (visited.has(currentUrl)) continue;
    if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

    visited.add(currentUrl);

    let elementFound = false;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('body');
        elementFound = true;
        break;
      } catch (error) {
        console.error(`Failed to navigate to ${currentUrl}: ${error}. Retrying (${i + 1}/${MAX_RETRIES})`);
        if (error.message.includes('Object with guid')) {
          // Reiniciar la página y continuar con el siguiente URL en la cola
          page = await browser.newPage();
          break;
        }
      }
    }

    if (!elementFound) continue;


    try {
      const mediaLinks = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href).filter(href => href.match(/\.(jpg|jpeg|png|mp4)$/)));
      for (const src of mediaLinks) {
        const fileType = src.split('.').pop();
        if (['jpg', 'jpeg', 'png'].includes(fileType)) {
          db.run("INSERT OR IGNORE INTO images (src) VALUES (?)", [src]);
        } else if (fileType === 'mp4') {
          db.run("INSERT OR IGNORE INTO videos (src) VALUES (?)", [src]);
        }
      }
      
      const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
      links.forEach(link => {
        const linkHostname = new URL(link).hostname;
        if (linkHostname === websiteHostname && !visited.has(link)) {
          queue.push(link);
        }
      });
    } catch (error) {
      console.error(`Failed to extract image or video information: ${error}`);
    }
  }

  await browser.close();
}

webCrawling('https://mmdate.vip/forums').then(() => {
  console.log('Crawling terminado');
  db.close();
});
*/


/*

const playwright = require('playwright');
const rp = require('request-promise');
const { URL } = require('url');
const sqlite3 = require('sqlite3').verbose();

const MAX_RETRIES = 3;

// Initialize the database
const db = new sqlite3.Database('./imagesVoutique.db');
db.run("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE, title TEXT)");
db.run("CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, href TEXT UNIQUE, type TEXT)");
db.run("CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT UNIQUE, visited BOOLEAN)");

async function fetchRobotsTxt(website) {
  try {
    const content = await rp(`${website}/robots.txt`);
    return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
  } catch (error) {
    return [];
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function webCrawling(website) {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  const visited = new Set();
  const queue = [website];
  const disallowedPaths = await fetchRobotsTxt(website);

  const websiteURL = new URL(website);
  const websiteHostname = websiteURL.hostname;

  let contador = 0;

  while (queue.length > 0) {
    contador++;
    console.log(`numero en la queue: ${queue.length}, contador: ${contador}`);

    shuffleArray(queue);
    const currentUrl = queue.shift();

    // Consult the database to see if the URL has already been visited
    let alreadyVisited = false;
    db.get("SELECT visited FROM queue WHERE url = ?", [currentUrl], (err, row) => {
      if (row && row.visited) alreadyVisited = true;
    });

    if (alreadyVisited) continue;
    if (visited.has(currentUrl)) continue;
    if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

    visited.add(currentUrl);

    // Insert the URL into the database and mark it as visited
    db.run("INSERT OR IGNORE INTO queue (url, visited) VALUES (?, ?)", [currentUrl, true]);

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('img');
        break;
      } catch (error) {
        console.error(`Failed to navigate to ${currentUrl}: ${error}. Retrying (${i + 1}/${MAX_RETRIES})`);
      }
    }

    try {
      const imgInfo = await page.$$eval('img', imgs => imgs.map(img => ({ src: img.src, title: img.alt })));
      for (const { src, title } of imgInfo) {
        db.run("INSERT OR IGNORE INTO images (src, title) VALUES (?, ?)", [src, title]);
      }

      const mediaLinks = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href)
        .filter(href => href.match(/\.(jpg|png|mp4|jpeg)$/i))); 
      for (const href of mediaLinks) {
        const type = href.split('.').pop();
        db.run("INSERT OR IGNORE INTO media (href, type) VALUES (?, ?)", [href, type]);
      }

      const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
      links.forEach(link => {
        const linkHostname = new URL(link).hostname;
        if (linkHostname === websiteHostname && !visited.has(link)) {
          queue.push(link);
          // Insert the URL into the database
          db.run("INSERT OR IGNORE INTO queue (url, visited) VALUES (?, ?)", [link, false]);
        }
      });
    } catch (error) {
      console.error(`Failed to extract information: ${error}`);
    }
  }

  await browser.close();
}

webCrawling('https://mmdate.vip/forums').then(() => {
  console.log('Crawling terminado');
  db.close();
});
*/


/*
const playwright = require('playwright');
const rp = require('request-promise');
const { URL } = require('url');
const sqlite3 = require('sqlite3').verbose();

const MAX_RETRIES = 3;

// Initialize the database
const db = new sqlite3.Database('./imagesBoutique.db');
db.run("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE, title TEXT)");
db.run("CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, href TEXT UNIQUE, type TEXT)");
db.run("CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT UNIQUE, visited BOOLEAN)");

async function fetchRobotsTxt(website) {
  try {
    const content = await rp(`${website}/robots.txt`);
    return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
  } catch (error) {
    return [];
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function webCrawling(website) {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();
  const visited = new Set();
  const queue = [website];
  const disallowedPaths = await fetchRobotsTxt(website);

  const websiteURL = new URL(website);
  const websiteHostname = websiteURL.hostname;

  let contador = 0;

  while (queue.length > 0) {
    contador++;
    console.log(`numero en la queue: ${queue.length}, contador: ${contador}`);

    shuffleArray(queue);
    const currentUrl = queue.shift();

    // Consult the database to see if the URL has already been visited
    let alreadyVisited = false;
    db.get("SELECT visited FROM queue WHERE url = ?", [currentUrl], (err, row) => {
      if (row && row.visited) alreadyVisited = true;
    });

    if (alreadyVisited) continue;
    if (visited.has(currentUrl)) continue;
    if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

    visited.add(currentUrl);

    // Insert the URL into the database and mark it as visited
    db.run("INSERT OR IGNORE INTO queue (url, visited) VALUES (?, ?)", [currentUrl, true]);

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('img');
        break;
      } catch (error) {
        console.error(`Failed to navigate to ${currentUrl}: ${error}. Retrying (${i + 1}/${MAX_RETRIES})`);
      }
    }

    try {
      const imgInfo = await page.$$eval('img', imgs => imgs.map(img => ({ src: img.src, title: img.alt })));
      for (const { src, title } of imgInfo) {
        db.run("INSERT OR IGNORE INTO images (src, title) VALUES (?, ?)", [src, title]);
      }

      const sourceInfo = await page.$$eval('source', sources => sources.map(source => ({
        src: source.src,
        type: source.type
      })));
      for (const { src, type } of sourceInfo) {
        if (src) {
          const fileType = type ? type.split('/').pop() : 'unknown';
          db.run("INSERT OR IGNORE INTO media (href, type) VALUES (?, ?)", [src, fileType]);
        }
      }

      const mediaLinks = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href)
        .filter(href => href.match(/\.(jpg|png|mp4|jpeg)$/i))); 
      for (const href of mediaLinks) {
        const type = href.split('.').pop();
        db.run("INSERT OR IGNORE INTO media (href, type) VALUES (?, ?)", [href, type]);
      }

      const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
      links.forEach(link => {
        const linkHostname = new URL(link).hostname;
        if (linkHostname === websiteHostname && !visited.has(link)) {
          queue.push(link);
          db.run("INSERT OR IGNORE INTO queue (url, visited) VALUES (?, ?)", [link, false]);
        }
      });
    } catch (error) {
      console.error(`Failed to extract information: ${error}`);
    }
  }

  await browser.close();
}

webCrawling('https://foro.laboutique.vip/').then(() => {
  console.log('Crawling terminado');
  db.close();
});
*/


//aqui se implemente ya el nuevo formato de maximo 3s por pagina 



const playwright = require('playwright');
const rp = require('request-promise');
const { URL } = require('url');
const sqlite3 = require('sqlite3').verbose();

// Initialize the database
const db = new sqlite3.Database('./images.db');
db.run("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, src TEXT UNIQUE, title TEXT)");
db.run("CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, href TEXT UNIQUE, type TEXT)");
db.run("CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT UNIQUE, visited BOOLEAN)");

async function fetchRobotsTxt(website) {
  try {
    const content = await rp(`${website}/robots.txt`);
    return content.split('\n').filter(line => line.startsWith('Disallow:')).map(line => line.split(' ')[1]);
  } catch (error) {
    return [];
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function webCrawling(website) {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();
  const visited = new Set();
  const queue = [website];
  const disallowedPaths = await fetchRobotsTxt(website);

  const websiteURL = new URL(website);
  const websiteHostname = websiteURL.hostname;


  let contador = 0
  while (queue.length > 0) {
    console.log("la queue es de " + queue.length + " y voy por la solo Q numero" + contador)
    contador++
    const currentUrl = queue.shift();

    // Consult the database to see if the URL has already been visited
    let alreadyVisited = false;
    db.get("SELECT visited FROM queue WHERE url = ?", [currentUrl], (err, row) => {
      if (row && row.visited) alreadyVisited = true;
    });

    if (alreadyVisited) continue;
    if (visited.has(currentUrl)) continue;
    if (disallowedPaths.some(path => currentUrl.includes(path))) continue;

    visited.add(currentUrl);
    db.run("INSERT OR IGNORE INTO queue (url, visited) VALUES (?, ?)", [currentUrl, true]);

    try {
      await Promise.race([
        page.goto(currentUrl, { waitUntil: 'domcontentloaded' }),
        new Promise(resolve => setTimeout(resolve, 8000)) // Espera 3 segundos y continúa
      ]);

      const imgInfo = await page.$$eval('img', imgs => imgs.map(img => ({ src: img.src, title: img.alt })));
      for (const { src, title } of imgInfo) {
        db.run("INSERT OR IGNORE INTO images (src, title) VALUES (?, ?)", [src, title]);
      }

      const sourceInfo = await page.$$eval('source', sources => sources.map(source => ({
        src: source.src,
        type: source.type
      })));
      for (const { src, type } of sourceInfo) {
        if (src) {
          const fileType = type ? type.split('/').pop() : 'unknown';
          db.run("INSERT OR IGNORE INTO media (href, type) VALUES (?, ?)", [src, fileType]);
        }
      }

      const mediaLinks = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href)
        .filter(href => href.match(/\.(jpg|png|mp4|jpeg)$/i))); 
      for (const href of mediaLinks) {
        const type = href.split('.').pop();
        db.run("INSERT OR IGNORE INTO media (href, type) VALUES (?, ?)", [href, type]);
      }

      const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
      links.forEach(link => {
        const linkHostname = new URL(link).hostname;
        if (linkHostname === websiteHostname && !visited.has(link)) {
          queue.push(link);
          db.run("INSERT OR IGNORE INTO queue (url, visited) VALUES (?, ?)", [link, false]);
        }
      });

    } catch (error) {
      console.error(`Failed to navigate to ${currentUrl} or extract information: ${error}`);
    }
  }

  await browser.close();
  console.log('Crawling terminado');
  db.close();
}

webCrawling('https://foro.laboutique.vip/');
