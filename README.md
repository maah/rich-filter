
# rich-filter
[![npm package](https://nodei.co/npm/rich-filter.png?compact=true)](https://nodei.co/npm/rich-filter/)

A very fast and versatile word filter, using both a blacklist **and a whitelist**.
The main advantage of this filter is its complexity - it's been tested thoroughly over time.
It is non-strict by default ('**ok**' will be found in '**ok**ay'), and finds duplicate words.
Use [`Filter.findStrict()`](#strict-mode) to only match full words instead.

## Whitelisting system
Each blacklisted ('forbidden') word gets its own whitelist (set of 'always allowed words'), to **reduce false positives as much as possible**.
As seen below, blacklist *hell* and whitelist *hello* to prevent users from using *hell*, *hellish*, and even *helll* in a bypass attempt, while still allowing *hello*.
Because each whitelist is small, and checked only when the matching blacklisted word is found, this process is **extremely fast**.
Of course, you can opt to not use a whitelist (see  [Strict mode](#strict-mode)).

[How do you know what to whitelist?](#managing-the-whitelist)

## Usage

### Creating the filter
While you can use the provided filter, making your own or adding words may be a good idea.
```js
// ES6: import * as RichFilter from 'rich-filter';
const RichFilter = require('rich-filter'); // ES5
const Filter = new RichFilter.Filter();

// Use the default word list
Filter.useDefault();
// ...or start making your own
Filter.reset()
	.addWord('hell', 'hello') // we added 'hello' to the whitelist of 'hell'!
	.addWord('forbidden') // empty whitelist
	.addWord('test', ['tester', 'testing']) // arrays are supported
	.addWord('test', 'tester,testing')    // ...and so are strings
	.editWord('test', 'tester') // overwrites the whitelist
	.removeWord('test'); // removes 'test' along with its whitelist
	
// Export it
JSON.stringify(Filter.sort()); // Sort not required, but more human readable
// You can also copy both arrays separately
var blacklist = Filter.getBlacklist();
var whitelist = Filter.getWhitelist();

// Import it
// Note: parameter is an object -> { blacklist: [], whitelist: [] }
Filter.from(require('./myFilter.json'));
```

### Test, find, replace words
The boolean value passed to `find()`, `findWithIndex()` and `censor()` determines whether or not to find/replace every filtered word that were found (`test()` will return after the first result).
In the case of a Discord bot, you may only want to know whether to delete a user's message or not.
Returning after the first found word is then a lot faster and makes sense.
```js
// Check if a sentence has filtered words
Filter.test('Hell yeah!'); // true
Filter.test('Even "hellish" gets caught'); // true
Filter.test('Hello World!'): // false

// Find the first filtered word (faster, you may not need every words)
//  find() ALWAYS returns an array (empty if nothing is found)
Filter.find('Hell yeah, forbidden words!'); // ['hell']
// ...or find all of them
Filter.find('Hell yeah, forbidden words!', true); // ['hell', 'forbidden']

// If you need to know WHERE the words are found
//  findWithIndex() also returns an array
Filter.findWithIndex('Hell yeah, forbidden words!'); // [{word: 'hell', index: 0}]
Filter.findWithIndex('Hell yeah, forbidden words!', true); // [{word: 'hell', index: 0}, {word: 'forbidden', index: 11}]

// Censor the filtered words
//  by default, it removes words
Filter.censor('Hell yeah, forbidden words!', true); // yeah, words!
Filter.censor('Hell yeah, forbidden words!', true, '*'); // **** yeah, ********* words!
Filter.censor('Hellll yeah, forbidden words!', true, '*'); // ****** yeah, ********* words!
```
### Strict mode
If you do not want to bother with a whitelist, you will likely want to use this instead.
Note that blacklisting '**ok**' will ***not*** detect '**ok**ay' in this case.
```js
// Strict mode - only matches full words
Filter.testStrict('Hell yeah!'); // true
Filter.testStrict('Helll yeah!'); //false
// The whitelist is unused because 'hell' !== 'hello'
Filter.testStrict('Hello yeah!'); //false

Filter.findStrict('Hell yeah!'); // ['hell']
Filter.findStrict('Hellm yeah!'); // []

Filter.findWithIndexStrict('Hell yeah', true); // [{ word: 'hell', index: 0 }]
Filter.findWithIndexStrict('Hhell yeah', true); // []

Filter.censorStrict('Hellll yeah, forbidden words!', true); // Hellll yeah, ********* words!
```

## Managing the whitelist
An easy way to know which words may cause issues is to use [a list of english words](https://raw.githubusercontent.com/dwyl/english-words/master/words.txt) (copyrights go to their respective owner(s)).
Before blacklisting a word, you can simply `ctrl + f` into such a list, and look for common words that contain it.
Then, whitelist those words (or part of them) at your will.

For example, you may want to be careful if blacklisting 'ass', as a lot of other words will contains these letters (such as grass, class, mass, password...).
An alternative could be to use a secondary filter on strict mode only.
