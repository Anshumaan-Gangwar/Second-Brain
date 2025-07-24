import axios from "axios";
import puppeteer from "puppeteer";

interface ContentMetadata {
  title: string;
  content: string;
  url?: string;
  thumbnail: string | null;
}

export const handleNote = async (title: string, content: string): Promise<ContentMetadata> => {
  return {
    title: title || 'Untitled Note',
    content: content || '',
    thumbnail: null
  };
};

export const fetchYouTube = async (url: string): Promise<ContentMetadata> => {
  try {
    const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([^&?/]+)/)?.[1];
    if (!videoId) throw new Error('Invalid YouTube URL');

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`
    );

    const video = response.data.items[0]?.snippet;
    if (!video) throw new Error('YouTube metadata not found');

    return {
      title: video.title,
      content: `${video.description}`,
      url: url,
      thumbnail: video.thumbnails.high?.url || null
    };
  } catch (error) {
    console.error('YouTube fetching error:', error);
    throw error;
  }
};

export const fetchTwitter = async (url: string): Promise<ContentMetadata> => {
  const browser = await puppeteer.launch({
    headless: true,  // Using boolean true for compatibility
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--ignore-certificate-errors'
    ],
    timeout: 60000
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('body');

    const metadata = await page.evaluate(() => {
      const tweetText = document.querySelector('article div[data-testid="tweetText"]')?.textContent?.trim() || 'No tweet content';
      const author = document.querySelector('article a[role="link"] span')?.textContent?.trim() || 'Unknown';
     
      
      return { author, tweetText };
    });

    return {
      title: `Tweet by ${metadata.author}`,
      content: `${metadata.tweetText}`,
      url: url,
      thumbnail: null,
    };
  } catch (error) {
    console.error('Twitter fetching error:', error);
    throw error;
  } finally {
    await browser.close();
  }
};

export const fetchWebsite = async (url: string): Promise<ContentMetadata> => {

  const browser = await puppeteer.launch({
    headless: true,  
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--ignore-certificate-errors'
    ],
    timeout: 60000
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000  });
    await page.waitForSelector('body');

    const result =  await page.evaluate(() => {
      const title = document.title || 'Untitled';
      const content = document.body.innerText?.trim() || '';
      
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const firstImage = document.querySelector('img')?.getAttribute('src');
      
      const thumbnail = ogImage || firstImage || null;
      const absoluteUrl = thumbnail && !thumbnail.startsWith('http') 
        ? new URL(thumbnail, window.location.origin).href 
        : thumbnail;

      return { title, content, thumbnail: absoluteUrl };
    });
    return {...result, url};
  } catch (error) {
    console.error('Website fetching error:', error);
    throw error;
  } finally {
    await browser.close();
  }
};
