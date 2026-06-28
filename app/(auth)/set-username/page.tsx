/* how user reached this page
    after verificaion. meaning, the session has been set

    checks to perform
*/

/* user flow
Q. what if user lefts after verification. 
Ans: they visit the site again, clicks the get started, 
    -if session token is present, porxy.ts redirects them to /chat
    - session is valid, /chat verifies for username, 
        -didn't find, redirect them to setUsername page (with a reason- set username to access the chat)
        -username found, continue to /chat
    
Q. manually tries to access the setUsername page?
Ans: proxy checks for session token
        -if no session token, redirect to /login
        -if session token present, redirect to /chat
            - the /chat sees no username, redirect to setusername page.
            - the chat sees username, continue to /chat
 */

export default function SetUserName() {
    // ask the user to set the name

    
}