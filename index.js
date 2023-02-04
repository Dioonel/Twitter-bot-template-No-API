import puppeteer from 'puppeteer-extra';
import { executablePath } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import CronJob from 'cron';

const username = 'your_username_here';                                       // Recommended to use env vars for username and password
const password = 'your_password_here';

let loginUrl = 'https://twitter.com/login';
let homeUrl = 'https://twitter.com';
let browser = null;
let page = null;

puppeteer.use(StealthPlugin());                                                     // Stealth plugin to avoid detection

async function main() {
    try {
        console.log('[MAIN FUNCTION]')
        browser = await puppeteer.launch({ headless: true, executablePath: executablePath(), userDataDir: './data' });
        if((await browser.pages()).length > 0) {
            page = (await browser.pages())[0];
        } else {
            page = await browser.newPage();
        }
    
        await loadCookies(page);
        await page.goto(homeUrl, {waitUntil: 'networkidle2'});

        let isLoggedIn = await page.$('div[aria-label="Tweet text"]');
        if(isLoggedIn) {
            await tweet(page);
        } else {
            await login(page);
            await tweet(page);
        }

        await saveCookies(page);
        await browser.close();
    } catch (err) {
        console.log('[MAIN FUNCTION ERROR]: ' + err);
    }
}


async function saveCookies(page) {
    try {
        const cookies = await page.cookies();
        const cookieJson = JSON.stringify(cookies, null, 2);
        await fs.writeFile('cookies.json', cookieJson, (err) => { if(err) console.log(err) });
    } catch (err) {
        console.log('[SAVE COOKIES FUNCTION ERROR]: ' + err);
    }
}


async function loadCookies(page) {
    try {
        const cookieJson = await fs.readFile('cookies.json', 'utf8', (err, data) => { if(err) console.log(err) });
        if(!cookieJson) return;
        const cookies = JSON.parse(cookieJson);
        await page.setCookie(...cookies);
    } catch (err) {
        console.log('[LOAD COOKIES FUNCTION ERROR]: ' + err);
    }
}


async function login(page) {
    try {
        console.log('[LOGIN FUNCTION]');
        await page.goto(loginUrl, {waitUntil: 'networkidle2'});

        await page.waitForSelector('input[autocomplete="username"]', {visible: true}, {timeout: 8000});
        await page.type('input[autocomplete="username"]',username,{delay: 400});
        await page.keyboard.press('Enter');
        await page.waitForSelector('input[autocomplete="current-password"]', {visible: true}, {timeout: 8000});
        await page.type('input[autocomplete="current-password"]',password,{delay: 300});
        await page.keyboard.press('Enter');
    } catch (err) {
        console.log('[LOGIN FUNCTION ERROR]: ' + err);
    }
}


async function tweet(page) {
    try{
        console.log('[TWEET FUNCTION]');
        await page.waitForSelector('div[aria-label="Tweet text"]', {visible: true}, {timeout: 10000});
        await page.click('div[aria-label="Tweet text"]', {delay: 200});
        await page.keyboard.type('Hello world!', {delay: 270});                                             // type your tweet
        await page.waitForTimeout(500);
        const elementHandle = await page.$("input[type=file]");
        await elementHandle.uploadFile('./imgs/example.jpg');                                               // upload image 
    
        await page.waitForTimeout(2000);
        await page.keyboard.down('ControlLeft');
        await page.keyboard.press('Enter');
        await page.keyboard.up('ControlLeft');
        console.log('tweet sent!');
    
        await page.waitForTimeout(10000);                                                 // wait for 10 seconds before closing the browser (if your internet is slow or tweet media is large you can increase this time to avoid errors)
    } catch (err) {
        console.log('[TWEET FUNCTION ERROR]: ' + err);
    }
}


// const job = new CronJob('0 * * * *', main);                                                     // execute every hour

const job = new CronJob.CronJob('* * * * *', main);                                              // execute every minute
job.start();