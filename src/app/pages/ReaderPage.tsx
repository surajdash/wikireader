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

        // Get main content with multiple fallback selectors
        let mainContent: Element | null = null;
        
        // Try #mw-content-text .mw-parser-output first (most common)
        const contentText = doc.querySelector('#mw-content-text');
        if (contentText) {
          mainContent = contentText.querySelector('.mw-parser-output');
        }
        
        // Fallback to #bodyContent .mw-parser-output
        if (!mainContent) {
          const bodyContent = doc.querySelector('#bodyContent');
          if (bodyContent) {
            mainContent = bodyContent.querySelector('.mw-parser-output');
          }
        }
        
        // Fallback to #mw-content-text directly
        if (!mainContent && contentText) {
          mainContent = contentText;
        }
        
        // Fallback to #content
        if (!mainContent) {
          mainContent = doc.querySelector('#content');
        }
        
        // Fallback to .mw-body-content
        if (!mainContent) {
          mainContent = doc.querySelector('.mw-body-content');
        }
        
        // Last resort: body
        if (!mainContent) {
          mainContent = doc.body;
        }
        
        // Validate we have content
        if (!mainContent || !mainContent.innerHTML || mainContent.innerHTML.trim().length === 0) {
          throw new Error('No content found on page - all selectors failed');
        }
        
        // Sanitize
        const sanitizedHTML = DOMPurify.sanitize(mainContent.innerHTML);
        
        // Final validation
        if (!sanitizedHTML || sanitizedHTML.trim().length === 0) {
          throw new Error('Sanitized HTML is empty');
        }

        setHtml(sanitizedHTML);
        setSections(parsedSections);
      } catch (err) {
        console.error("Failed to fetch article:", err);
        
        // Set user-friendly error message
        setHtml(`
          <div style="padding: 3rem 2rem; text-align: center; color: var(--color-text-secondary);">
            <h2 style="color: var(--color-text-primary); margin-bottom: 1rem;">Failed to Load Article</h2>
            <p style="margin-bottom: 1.5rem;">Could not fetch or parse the Wikipedia page.</p>
            <p style="margin-bottom: 0.5rem;"><strong>Error:</strong> ${err instanceof Error ? err.message : 'Unknown error'}</p>
            <p style="margin-top: 2rem;">
              <a href="${src}" target="_blank" style="color: var(--color-link); text-decoration: underline;">
                Open original Wikipedia page →
              </a>
            </p>
          </div>
        `);
        setSections([]);
        setReadingTime(0);
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
