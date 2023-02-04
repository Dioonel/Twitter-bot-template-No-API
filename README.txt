Once you clone / fork this project:

- Execute "npm i" to install all packages and dependencies
- On index.js enter your twitter credentials (line 7 and 8)
- Execute "node index.js" to test
- Start building your custom methods for your wished behavior, such as random tweets, images or videos




Extra notes:

- On the bottom of index.js, set your preferred tweet interval (once per hour and once per minute are already there).
If you don't know how to do it, you can experiment in https://crontab.guru

- If the bot stops working, you can debug using logs after every single operation.
This template relies on HTML structure, so future Twitter updates might break instructions.
Keep an eye on the origin project, we'll fix and update it if it happens.

- This bot is already configured so that it should not be detected by Twitter, however, use it at your own risk.
It's also optimized to login once and keep that session open until it expires, after that, it'll login again automatically.