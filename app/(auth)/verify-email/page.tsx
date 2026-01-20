"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return(
        <div className='flex flex-col'>
            <h1>Please verify your email</h1>
            <p>You are almost there! We have sent an email to</p>
            <h2>{email}</h2>
            <p>still cannot find the email</p>
            <button>Resend Verification Email</button>
            
        </div>
    )
}

export default function VerifyPage() {
    return(
        <Suspense fallback= {<div>Loading...</div>}>
            <VerifyContent/>
        </Suspense>
    )
}


/* 
case1: user clicks on resend, disable the button for 1 minutes,user goes to mail inbox.
case2: user clicks on resend, and then leaves the websites.
case3: user clicks on resend, then go back to signup page.(user should see the email and password details or not the password just the email).then returns to the verrification page. just messing around. the ui must stay still(no page refresh)
case4: user wants to change the email(entered wrong email), goes back to singup page via link or going back.(should see the previously entered details)
*/

/* 
what user should see on clicking the verification link
case1: within the 24hrs window, UI-> u have been verified.
case2: after 24hrs(expired token), UI-> verification token expired, resend the email (with link to signup page or the landing page).
case3: user already verified or not, clicks the verification link from old  email (invalid token)anyway 
*/