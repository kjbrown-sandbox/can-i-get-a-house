// import Image from "next/image";
// import styles from "./page.module.css";

// export default function Home() {
//   return (
//     <div className={styles.page}>
//       <main className={styles.main}>
//         <Image
//           className={styles.logo}
//           src="https://nextjs.org/icons/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol>
//           <li>
//             Get started by editing <code>src/app/page.tsx</code>.
//           </li>
//           <li>Save and see your changes instantly.</li>
//         </ol>

//         <div className={styles.ctas}>
//           <a
//             className={styles.primary}
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className={styles.logo}
//               src="https://nextjs.org/icons/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//             className={styles.secondary}
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className={styles.footer}>
//         <a
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
// import globals from "./globals.css";
import "./globals.css";
interface Affordability {
   status: string;
   color: string;
   recommendedCost: string;
}

export const App: React.FC = () => {
   const [income, setIncome] = useState<number | string>("");
   const [housingCost, setHousingCost] = useState<number | string>("");
   const [affordability, setAffordability] = useState<Affordability | null>(
      null
   );

   const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      const incomeValue = parseFloat(income as string);
      const housingCostValue = parseFloat(housingCost as string);
      const recommendedCost = incomeValue * 0.3;

      if (housingCostValue > recommendedCost) {
         setAffordability({
            status: "Above recommended limit",
            color: "red",
            recommendedCost: recommendedCost.toFixed(2),
         });
      } else {
         setAffordability({
            status: "Within recommended limit",
            color: "green",
            recommendedCost: recommendedCost.toFixed(2),
         });
      }
   };

   return (
      // <div className="container dark-mode">
      // <div>
      // <div className="dark-mode">
      // <div className={`dark-mode ${styles.container}`}>
      <div className={styles.container}>
         <h1>Affordability Calculator</h1>
         <form onSubmit={handleSubmit}>
            <label>Monthly Income ($):</label>
            <input
               type="number"
               value={income}
               onChange={(e) => setIncome(e.target.value)}
               required
            />

            <label>Housing Cost ($):</label>
            <input
               type="number"
               value={housingCost}
               onChange={(e) => setHousingCost(e.target.value)}
               required
            />

            <button type="submit">Calculate</button>
         </form>

         {affordability && (
            <div id="result">
               <p>
                  Affordability Status:{" "}
                  <span style={{ color: affordability.color }}>
                     {affordability.status}
                  </span>
               </p>
               <p>
                  Recommended Housing Cost (30% Rule): $
                  {affordability.recommendedCost}
               </p>
            </div>
         )}
      </div>
   );
};

export default App;
