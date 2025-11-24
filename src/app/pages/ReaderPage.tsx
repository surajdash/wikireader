import React, { useEffect, useState, useContext } from "react";
import DOMPurify from "dompurify";
import { nanoid } from "nanoid";
import { ThemeContext } from "../contexts/ThemeContext";

/**
 * Section data structure for table of contents
 */
interface Section {
  id: string;
  title: string;
  element: HTMLElement;
}

interface ReaderPageProps {
  /** URL of the Wikipedia article to fetch and display */
  src: string;
}

/**
 * ReaderPage Component
 * 
 * Fetches a Wikipedia article, parses and sanitizes the HTML,
 * generates a table of contents from headings, and displays
 * the content in a clean reading interface.
 * 
 * Features:
 * - Fetches and sanitizes Wikipedia HTML using DOMPurify
 * - Rewrites image URLs to use HTTPS
 * - Generates table of contents from h2 and h3 headings
 * - Provides smooth scrolling navigation
 * - Supports light/dark themes
 */

const ReaderPage: React.FC<ReaderPageProps> = ({ src }) => {
  const [html, setHtml] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [readingTime, setReadingTime] = useState<number>(0);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(src);
        const text = await res.text();

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Remove Wikipedia UI elements and clutter
        const elementsToRemove = [
          '#mw-navigation',
          '#mw-panel',
          '.vector-menu',
          '.mw-editsection',
          '#toc',
          '.navbox',
          '.metadata',
          '.sistersitebox',
          '.noprint',
          '#catlinks',
          '#footer',
          '.mw-jump-link',
          '.printfooter',
          '.mw-empty-elt',
          '#siteSub',
          '#contentSub',
          '.mw-indicators',
          '.hatnote',
          '#coordinates'
        ];

        elementsToRemove.forEach(selector => {
          doc.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Fix image URLs and attributes
        doc.querySelectorAll("img").forEach((img) => {
          // Fix src
          const srcAttr = img.getAttribute("src");
          if (srcAttr) {
            if (srcAttr.startsWith("//")) {
              img.src = "https:" + srcAttr;
            } else if (srcAttr.startsWith("/")) {
              img.src = "https://en.wikipedia.org" + srcAttr;
            }
          }
          
          // Fix srcset for responsive images
          const srcsetAttr = img.getAttribute("srcset");
          if (srcsetAttr) {
            const fixedSrcset = srcsetAttr
              .split(',')
              .map(src => {
                const [url, descriptor] = src.trim().split(' ');
                let fixedUrl = url;
                if (url.startsWith("//")) {
                  fixedUrl = "https:" + url;
                } else if (url.startsWith("/")) {
                  fixedUrl = "https://en.wikipedia.org" + url;
                }
                return descriptor ? `${fixedUrl} ${descriptor}` : fixedUrl;
              })
              .join(', ');
            img.setAttribute("srcset", fixedSrcset);
          }
          
          img.loading = "lazy";
        });

        // Fix all links to be absolute
        doc.querySelectorAll("a").forEach((link) => {
          const href = link.getAttribute("href");
          if (href && href.startsWith("/")) {
            link.setAttribute("href", "https://en.wikipedia.org" + href);
          }
        });

        // Calculate reading time
        const textContent = doc.body.textContent || "";
        const wordsPerMinute = 200;
        const wordCount = textContent.trim().split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        setReadingTime(minutes);

        // Generate sections from headings (only from main content)
        const contentDiv = doc.querySelector('#mw-content-text') || doc.body;
        const headingNodes = Array.from(contentDiv.querySelectorAll("h2, h3")) as HTMLElement[];
        
        const parsedSections: Section[] = headingNodes
          .filter(h => {
            // Filter out headings from unwanted sections
            const text = h.textContent?.toLowerCase() || "";
            return !text.includes("navigation") && 
                   !text.includes("contents") && 
                   !text.includes("languages");
          })
          .map((h) => {
            const id = nanoid();
            h.id = id;
            return { id, title: h.innerText, element: h };
          });

        // Get only the main content
        const mainContent = contentDiv.querySelector('.mw-parser-output') || contentDiv;
        
        // Sanitize
        const sanitizedHTML = DOMPurify.sanitize(mainContent.innerHTML);

        setHtml(sanitizedHTML);
        setSections(parsedSections);
      } catch (err) {
        console.error("Failed to fetch article:", err);
      }
    };

    fetchArticle();
  }, [src]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`reader-container ${theme}`}>
      <aside className="sidebar">
        <h2>Table of Contents</h2>
        {readingTime > 0 && (
          <div className="reading-time">
            📖 {readingTime} min read
          </div>
        )}
        <ul>
          {sections.map((sec) => (
            <li key={sec.id} onClick={() => scrollToSection(sec.id)}>
              {sec.title}
            </li>
          ))}
        </ul>
      </aside>
      <main
        className="article-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default ReaderPage;
