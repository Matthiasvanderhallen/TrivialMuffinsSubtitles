#Format
Three files represent the three different languages:
*en.txt
*fr.txt
*nl.txt

Each of these must have the same number of lines, and each line represents a block of text that together forms a subtitle.
The way that subtitles are shown is decided by the web browser itself (i.e. line breaks). If you want one block of subtitles to have a line break, do *NOT* press enter.
Instead, type `<br/>` on the desired location of your linebreak. If you want to suggest a word break (i.e. hyphenation), type `&shy;` where you suggest the word break can occur.

#Edit tips
I advise to use sublimeText, where you can go to the view menu > Layout > Columns: 3 to get into three column mode. Then you can load each translation file in a column and edit them together.
This way, you can easily check that the text at a certain line number is the same in all three languages.

#Merging and deploying
The command ``./merger`` creates a file called `output.txt` that represents the merged languages.
the command ``./deploy`` deploys the newest subtitles. It calls the ``merger`` command, and moves the output.txt file to `ondertitels.txt` in the main folder (this folders parent director), where the HTTP server loads it. If necessary, reload the Master webpage to reflect these changes.
