    Purpose:
        Create a full stack ecommerce application for the purposes of selling pottery
        Use a red colour scheme as designated by "Client"
        Ensure proper security measures are undertaken
        Design a proper UI/UX experience
        Learn as much as possible
        Write Two Server scripts in JS and C#

    Languages:
        JS, TS and C#

    Technology:
        React, tailwind CSS, Multer, dotnet, node.JS, Bcrypt, JWT, Material UI, Framer-motion, Prettier

    Challenges:
        Updating the website as Client wants changed
        Ensuring sanitation
        Learning C# 
        Maintaining style across pc and mobile platforms
        Ensuring Proper LOA designation
        

Self TODO LIST:

    COMPLETE FALSE credit card authentication
    COMPLETE User self account deletion 
    COMPLETE Test user data encryption 
    COMPLETE Test mobile responsivness and update accordingly 
    COMPLETE Have images self delete or move to backup directory 
    COMPLETE formatt COMPLETE DO DAILY
    COMPLETE Have Storefront images be clickable to show description 
    COMPLETE Update sql to handle following date and times
    COMPLETE Add date and time to orders 
    COMPLETE Add date ordering to order view menu 
    COMPLETE Add item grouping to order menu 
    COMPLETE test new theme for storeItems, use a two contrasting colours, use one for the box and one for the text, in any buttons reverse this theme 
    COMPLETE Add floating button responses, i.e. if add to cart is clicked float +1 next to 
    COMPLETE Limit admin create to prevent overflow of suusers with the same username
    COMPLETE Add motion framer to increase responsivness in design, at least test to see if you actually want it in the design 
    COMPLETE Implement the same brochure system but for storeItems to further reduce server load
    COMPLETE Put tokens into cookies over localStorage
    COMPLETE Switch to class based programming for ease of organisation A̢͉͍͙͇͌̔̄͝ǘ̷̠̥̳̮̜͜g̸͙͓͎͍̟̟̐̉̇̍͊͆͝h̵͔͉̰̬͑͋͝u̵̹̳̜̳͕͌̃̅͊g̸͚̗͍̦̞͚͋͑̂̆̍̈́͆͜h̶̢̗̮͙̖͖̓͗̓̍̏̒̊̔̕
        Addit:
            Wasnt that bad actually :D
    COMPLETE Redo Styling to fit earthy colours
 
Feedback TODO List:

    COMPLETE Implement Responsive Design: Optimize design for various screen sizes and devices.
    COMPLETE Retain State After Component Unmount: Explore using LocalStorage, Cookies, or unique user ID-based cookie storage to retain state after users leave the webpage.
        Addit: 
            Its like saving progress, i.e. if you visit this spot on say google maps and you register it as seen, store that in local memory 
                Idea for implemen:
                    Save current page into memory, could be easy and painless page meaning the internal page not the page url itself as that would not need to be saved, also include an encrypted login state?
                    Save visited items? i.e. have a tick if you have clicked its description?
                    Saved bought items into localStorage to give an idea on what a customer has bought, simply store and retrieve
    COMPLETE Implement Route Protection: Use JWT or session-based authentication for protecting routes on the backend.
        Addit: 
            More research into how i did it and whether it is secure or not is required 
    COMPLETE Check Database Connection Limits: Investigate if the database has a maximum amount of concurrent connections and consider implementing a connection pool if necessary.
    COMPLETE Ensure API Security: Validate request bodies to prevent SQL Injection vulnerabilities.
    COMPLETE Consider Learning C# or Golang: Expand development skills by exploring languages like C# or Golang, commonly used in the industry.
        Addit: 
            Maybe rewrite server code to use C# or Golang? potential option
    COMPLETE Explore UI Enhancement: Experiment with color theory, UI beautification using tools like React Spring, and ensuring consistency in font sizes and weights.
    COMPLETE Optimize Frontend Code: Continuously strive for clean and efficient frontend code.
    COMPLETE Optional: Further UI Development: If interested, delve deeper into UI development, considering resources like AWS for full-stack solutions.
    COMPLETE Explore Color Theory: Learn about the 60-30-10 rule for color coordination and proper color selection.
    COMPLETE Enhance UI Beautification: Experiment with hover effects, box shadows, and other visual enhancements using libraries like React Spring.
        Addit: 
            Added box shadows for storeItem cards, looks nice so far, too much?
    COMPLETE Maintain Consistency in Design: Ensure consistency in font sizes, weights, and other attributes for a polished UI.
    COMPLETE Continue Learning and Experimenting: Keep exploring and experimenting with UI development to improve skills and knowledge in the area.
    COMPLETE Refurbish JWT to use cookies or an interceptor which will update the token silently when it is near expirery 
    COMPLETE port server to C# as recommended/suggested by Chris
    COMPLETE Improve mobile design by using hamburger Setup for the navigation over the tab option
    COMPLETE implement additional SQL checks to ensure sanitation 

Client adjustment of goals and scope:

    COMPLETE Adjust storeFront to be a oneitem one customer deal as items will not be produced in any quantity whatsoever
        Addit:
            Adjust storeItems to use 3 states, open, pending, and bought which will adjust how they are presented
            Remove buying multiples of items, no longer necessary can be used to make things beautiful
    DESIGN CHANGES:
        COMPLETE Adjust brochure to be a about me page for the client NO PII NO PII NO PII
            Addit:
                Update as needed and implement discovered changes in other pages
        COMPLETE Include reviews in about me
            Addit:
                Include a star system/ Star system included, happy with
        UNCOMPLETE Improve overall design and make the page look far more inviting i.e. maybe some image on the sidebar that can scroll nicely
            Addit:
                Want to add but am hesitant as it may end up looking like a boomers plate, need to make it look nice in some way that i dont yet know, brush up on UI/UX
        COMPLETE Add itemsperpage button 1/10 items per page
        COMPLETE Fix image width on storeItems
        COMPLETE Delivery information add to purchase

    Failed
      Implement and Learn websocket to update items whenever other users make a purchase
        Decided it was too complex to use on an old project, need to design with this in mind
      Implement login/RegistrationPage
      Implement login saving
        Decided this would also go best into a page with its design being inclusive
    Success
        Massively changed thoughprocess when it comes to designing the page
        Learned how to use C#
        JWT tokens and authentication in a seamless process
        Encryption learned
        Class based programming and organising
        Thought process regarding when and when not to make into a component 
        level up in
            tailwind, JS/TS, C# API design, security, functionality
        Personal rating
            6/10
            using an actual scale where 5 is average instead of bad i do not believe this is bad however some of the code within the tail is messy and hard to understand, my use of divs to too much and i need to change this for code readability, the site went through alot of redesigned but i still think it could look better, not a designer and might be getting over critical here. Context is overly used need to use localStorage/session storage etc instead to avoid bloating the context, login should have been a seperate page maybe but the registration needed to be  again, bloat
        Final thoughts:
            imagine self rating this hard