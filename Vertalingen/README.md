#Format
Three files represent the three different languages:
*Engelse vertaling.txt
*Franse vertaling.txt
*Nederlandse vertaling.txt

Each of these must have the same number of lines, and each line represents a block of text that together forms a subtitle. Each line should start with the | delimiter.
The way that subtitles are shown is decided by the web browser itself (i.e. line breaks). If you want one block of subtitles to have a line break, do *NOT* press enter.
Instead, type `<br/>` on the desired location of your linebreak. If you want to suggest a word break (i.e. hyphenation), type `&shy;` where you suggest the word break can occur.

#Edit tips
I advise to use sublimeText, where you can go to the view menu > Layout > Columns: 3 to get into three column mode. Then you can load each translation file in a column and edit them together.
This way, you can easily check that the text at a certain line number is the same in all three languages.

#Checking tips

Some useful regexes exist to see whether all separate langauge files conform to the syntax rules.

*`\|` : This must equal the total number of lines in the file
*`\n[^\n]` : This represents a new line, without a | at the start. Expected #: 0.
*`[^\n]|` : This represents a | that is not the first character of a line. Expected #: 0.

#Merging
The command ``./merger`` creates a file called output.txt that represents the merged languages. Move it to a file called ondertitels.txt on the HTTP Server to load it.
Reload the Master webpage to reflect these changes.

For this merger file, the following might be a useful, albeit imperfect, regex:
*`\n\|\s*.+?\|\s*\|\s*.+?\n`: By playing around with the location of `.+?` you can find lines wich are blank in one or two languages, but given in a third. These should be checked explicitly.

