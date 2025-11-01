---
layout: page.njk
title: Built with AI
description: How Strumboli was created with AI assistance
---

# Built with AI

Hi! This is Ben Farrell, the author of Stromboli, speaking. I wanted to add a personal note (that I actually wrote myself).
This project ended up being mostly built with AI.

And when I say mostly, when you look at the actual code - it's really all of it.

This project started as I wanted to try the newly released Suzuki Omnichord. While I play keyboard, guitar strumming
is so prominently featured in tons of music I want to play. I was feeling left out.

Unfortunately, the Omnichord is $800 or more, and there have been various strumming controllers throughout
the years, but they either looked not so great to use, expensive, or too complex of a DIY build.

I started wondering about all the expressive features a drawing tablet could provide. I've had a few over the years,
but for this project, [bought a Deco 640 for $30](https://www.amazon.com/Deco-640-Sensitivity-Battery-Free-Designing/dp/B0D6XZF9N4/)!


## Starting with REAL Web Prototyping
This project start with real coding in a web browser (I'm best at developing on the web).

I started liking what I saw, but really needed the raw data from the device. Not only was the tablet acting 
as a mouse throughout using this prototype (annoying), but it would only move my mouse in a relative fashion
in browser rather than using absolute coordinates.

This meant I couldn't use the tablet to make the pointer jump from one place to another. It would always
move from where I last had my cursor. Despite how promising this felt, it was a non-starter. While [WebHID](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)
was a thing to make this possible, it's been unfortunately deprecated and relegated to Microsoft Edge and Chrome plugins.

So, I moved on to Node.js. I used [node-hid](https://github.com/node-hid) to directly interact with the tablet.
I was reading the raw bytes coming over USB. And no, I still wasn't using AI at this point. I ended up reading things
well enough to work, but wrong enough to miss 100x the precision of what I could have if I read it right, but it was working.

I wired up a web based dashboard to visualize some of what was going on. The data was communicated over websockets.
It was working really well, and felt good. When I ran Ableton Live in the background listening to the right MIDI channels,
it sounded like a natural, expressive strum. I was hooked.

Still no AI, though.

I end up liking this project well enough that I wanted to actually make it work on my [Zynthian](https://zynthian.org/) and really just
be able to share it easily. Node.js was holding me back. Python is really the best choice. It's an easy
language, but already installed everywhere I want to run this project.

## AI bridged the gap to a language I'm not good at
Unfortunately, I'm not great at Python. And hooking into the system level stuff I needed to make this run seamlessly
was an even worse prospect.

I hadn't had much luck with "vibe coding" in the past, but for this - I took a chance and relied on Cursor.
As an experiment, I had it do EVERYTHING for me.

I initially used it to code convert the Node.js code. Then I started adding features. I used my 25 years of software
experience to refactor, architect, and steer things the right way.

If it weren't for AI, this would have taken me 6 months or more. Given that it was going so quickly, I started adding
features I never would have considered for a side project, just because they take too long.

But here, I could try things and scrap them quickly. This is what led to building in a web server and complete
dashboard to make this controller extremely flexible and customizable while running. The web dashboard
features reactive visualizations to show how you're interacting with the tablet and what output it's sending
to strum and create notes.

## But then it was about speed and features
As a web developer, this is my wheelhouse, but would have taken me an extremely long time to get right.
Even the vector art representations of the pen and tablet on the page are done with AI. Yes, I even played with
drawing the logo in SVG all through AI.

And then I did something I would have never tried: creating installers. This is an art, and I couldn't have imagined 
doing this myself without studying for weeks on how it worked. But no, it was churned out in a few hours with AI.

Having come so far, I thought it would be great to make this usable for other folks, so used AI to design
and create a documentation site, all the way down to writing copy and instructions.

All of this would have made the project stretch to months (if I was working full-time I'd wager). Instead, I did it in a few
weeks. And I have something that's a joy to use.

Yes, I did vibe code. But it was through constant testing, imagining, and refactoring.

## Be cautious about this project
I feel like it's important to disclose this. Maybe you hate AI, but more importantly - it's a system that I don't
necessarily understand all the way through. There could be bugs or things that AI was dumb enough that its only
a surface level implementation that will fall apart.

Either way, be cautious with this project. It's AI and I can't vouch for all the code. But it's super fun and it never would
have happened without it!
