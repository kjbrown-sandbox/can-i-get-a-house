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
import "./globals.css";
import { calculatePMI, getAffordableHousePrice, getSalaryNeeded, UserInputs } from "@/utils";

const currentMortgageInterestRate = 0.0631;
const monthlyInterestRate = currentMortgageInterestRate / 12;

export const App: React.FC = () => {
   const [userInputs, setUserInputs] = useState<UserInputs>({
      income: "",
      homePrice: "",
      downPayment: "",
   });

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof UserInputs) => {
      const value = e.target.value;
      if (value === "") {
         setUserInputs({ ...userInputs, [name]: value });
      } else if (!isNaN(Number(value))) {
         setUserInputs({ ...userInputs, [name]: Math.min(Number(value), 10000000) });
      }
   }

   const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
         setUserInputs({ ...userInputs, downPayment: value });
      } else if (!isNaN(Number(value))) {
         setUserInputs({ ...userInputs, downPayment: value });
      }
   }

   let { homePrice, monthly, allCosts } = getAffordableHousePrice(userInputs.income, monthlyInterestRate );
   homePrice = Math.round(homePrice);
   monthly = Math.round(monthly);

   let {
      cost: pmiCost,
      months,
      totalPMICost,
   } = calculatePMI(homePrice, homePrice * userInputs.downPayment / 100, monthly, monthlyInterestRate);
   pmiCost = Math.round(pmiCost);
   totalPMICost = Math.round(totalPMICost);

   return (
      <div className={styles.page}>
         <div className={styles.leftPanel}>
            <input
               type="text"
               placeholder="Enter your income"
               value={userInputs.income}
               onChange={(e) => handleInputChange(e, "income")}
            />
            <input
               type='text'
               placeholder='Enter your home price'
               value={userInputs.homePrice}
               onChange={(e) => handleInputChange(e, "homePrice")}
            />
            <input
               type='text'
               placeholder='Enter your down payment'
               value={userInputs.downPayment}
               onChange={handleDownPaymentChange}
            />
         </div>
         <div className={styles.rightPanel}>
            {userInputs.income && (<><p>{homePrice}</p>
            <p>
               At {userInputs.downPayment}% down, you would pay ${pmiCost} in PMI over the course of{" "}
               {months} months with an average of $
               {totalPMICost ? Math.round(totalPMICost / months) : 0} per month.
            </p>
            <br/>
            <p>
               Here is your monthly breakdown of costs:
            </p>
            {Object.keys(allCosts).map((key) => {
               let keyCost = 0;
               if (allCosts[key].type === "percentage") {
                  keyCost = Math.round(allCosts[key].cost * homePrice);
               } else {
                  keyCost = Math.round(allCosts[key].cost);
               }
               return (
                  <p key={key}>
                     {key}: ${keyCost}
                  </p>
               );
            })}
         </>)}
            {typeof userInputs.homePrice === 'number' && (
               <>
                  <p>For a house price of {userInputs.homePrice}, you need to make ${getSalaryNeeded(userInputs.homePrice as number, userInputs.downPayment as number / 100 * (userInputs.homePrice as number), monthlyInterestRate)}</p>
                  <p>or ${Math.round(getSalaryNeeded(userInputs.homePrice as number, userInputs.downPayment as number / 100 * (userInputs.homePrice as number), monthlyInterestRate) / 12)} per month.</p>
                  <p>Your monthly housing cost is ${getSalaryNeeded(userInputs.homePrice as number, userInputs.downPayment as number / 100 * (userInputs.homePrice as number), monthlyInterestRate) / 12 * 0.3}</p>
               </>
            )}
         </div>
      </div>
   );
};
export default App;

/*
A house should be 30% of your gross income but should include all costs associated with the house.
Costs include:
- utilities
- maintenance
- property taxes
- insurance
- mortgage (obviously)
- HOA fees
- PMI

We can add in different methods to be more or less conservative (like 30% of net income or even a 15-year mortgage)
or other rules


The reason PMI length in months to repay goes up as mortgage cost goes up is because,
as mortgage cost goes up, the relative fixed costs of the house go down. (A fixed $400 cost
for utilities means a lot less when your mortgage is $2000 than when it's $1000.) Why does
that matter? Well, imagine there was no interest. If you pay 0% down, then you'd need 20% of
the time to get to 20% equity. But when you add in interest, the beginning time is heavily
skewed towards only paying down interest--which means it takes longer than 20% of the time to
get to 20% equity. As interest starts playing a bigger factor, the fixed costs have less weight,
so you spend more time just paying interest, which means you spend more time paying PMI because
it takes longer to get to 20% equity.
*/


/* Things left to do:
- Get the calculator to work for home price
   - If no other inputs are entered, then shows how much income you need to afford it (maybe
     with a slider for down payment)
   - If with down payment, then shows how much income you need to afford it
   - If with income, then shows if it's affordable and, if not, how much more income you need or
     how much of a down payment you need
      - Could also show how easily it can be afforded if it is affordable

V1:
- 
- Hmmmmm. I made need a better way to separate the app into version--like v1, v2


I think I need this in a google doc or something. Comments are not so good at recording these things.
*/