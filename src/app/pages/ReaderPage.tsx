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
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(src);
        const text = await res.text();

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Rewrite image URLs & lazy-load
        doc.querySelectorAll("img").forEach((img) => {
          const srcAttr = img.getAttribute("src");
          if (srcAttr && !srcAttr.startsWith("http")) {
            img.src = "https:" + srcAttr;
          }
          img.loading = "lazy";
        });

        // Generate sections from headings
        const headingNodes = Array.from(doc.querySelectorAll("h2, h3")) as HTMLElement[];
        const parsedSections: Section[] = headingNodes.map((h) => {
          const id = nanoid();
          h.id = id;
          return { id, title: h.innerText, element: h };
        });

        // Sanitize
        const sanitizedHTML = DOMPurify.sanitize(doc.body.innerHTML);

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
