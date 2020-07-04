export class Filter {
    private blacklist: string[] = [];
    private whitelist: string[] = [];


    getBlacklist(): string[] {
        return this.blacklist.slice(); // copies the array
    }

    getWhitelist(): string[] {
        return this.whitelist.slice(); // copies the array
    }

    /**
     * Adds a new word to the blacklist, if `wordWhitelist` is used, link it to
     * its own whitelisted words.
     * If the word already exists, will update its whitelist instead.
     * @param word Word to blacklist
     * @param newWordWhitelist Word(s) that should be whitelisted if `word` is found
     * @returns The updated filter
     */
    addWord(word: string, wordsToWhitelist?: string | string[]): Filter {
        word = word.toLowerCase();
        // Avoid casing issues
        if (wordsToWhitelist)
            wordsToWhitelist = typeof wordsToWhitelist === 'string'
                ? wordsToWhitelist.toLowerCase()
                : wordsToWhitelist.map(v => v.toLowerCase());
        if (this.blacklist.indexOf(word) == -1) {
            this.blacklist.push(word);
            if (!wordsToWhitelist) this.whitelist.push('');
            else if (typeof wordsToWhitelist === 'string') this.whitelist.push(wordsToWhitelist);
            else this.whitelist.push((wordsToWhitelist as string[]).join(','));
        }
        // Update whitelist instead
        else if (wordsToWhitelist) {
            const index = this.blacklist.indexOf(word);
            if (typeof wordsToWhitelist === 'string') this.whitelist[index] = wordsToWhitelist;
            else this.whitelist[index] = (wordsToWhitelist as string[]).join(',');
        }
        return this;
    }

    /**
     * Changes a blacklisted word's whitelist.
     * @param word Blacklisted word
     * @param wordsToWhitelist Word(s) that should be whitelisted
     * @returns The updated filter
     */
    editWord(word: string, wordsToWhitelist: string | string[]): Filter {
        word = word.toLowerCase();
        // Avoid casing issues
        if (wordsToWhitelist)
            wordsToWhitelist = typeof wordsToWhitelist === 'string'
                ? wordsToWhitelist.toLowerCase()
                : wordsToWhitelist.map(v => v.toLowerCase());
        if (this.blacklist.indexOf(word) != -1) {
            const index = this.blacklist.indexOf(word);
            if (typeof wordsToWhitelist === 'string') this.whitelist[index] = wordsToWhitelist;
            else this.whitelist[index] = (wordsToWhitelist as string[]).join(',');
        }
        return this;
    }

    /**
     * Removes a word from the blacklist, and its linked whitelisted words.
     * @param word Word to remove
     * @returns The updated filter
     */
    removeWord(word: string): Filter {
        word = word.toLowerCase();
        if (this.blacklist.indexOf(word) != -1) {
            const index = this.blacklist.indexOf(word);
            this.blacklist.splice(index, 1);
            this.whitelist.splice(index, 1);
        }
        return this;
    }

    /**
     * Removes all blacklisted and whitelisted words.
     * @returns The now-empty filter
     */
    reset(): Filter {
        this.blacklist = [];
        this.whitelist = [];
        return this;
    }

    /**
     * Returns the default blacklist and whitelist.
     * For any issue, you can still add/remove/update words.
     * @returns An example filter provided with this package
     */
    useDefault(): Filter {
        const defaultList = require('./default.json');
        this.blacklist = defaultList.blacklist;
        this.whitelist = defaultList.whitelist;
        return this;
    }

    /**
     * Imports the filter from an object, overwriting the previous filter.
     * @param lists Object representing a blacklist and whitelist
     * @returns The resulting filter
     */
    from(lists: { blacklist: string[], whitelist: string[] }): Filter {
        if (lists.blacklist.length != lists.whitelist.length)
            throw new Error("The given word blacklist and whitelist cannot be different sizes. ("
                + lists.blacklist.length + " and " + lists.whitelist.length + ")");
        this.blacklist = lists.blacklist;
        this.whitelist = lists.whitelist;
        return this;
    }

    /**
     * Sorts the blacklist and whitelist alphabetically without
     * messing up the index relations.
     * @returns The sorted filter, or a copy
     */
    sort(): Filter {
        // Sort alphabetically
        const bl = this.blacklist;
        const wl = this.whitelist;

        const tmp = bl.slice(); // copies the array
        bl.sort();

        // Sorts bl, finds the difference between sorted and non-sorted
        // Then, switches both index... which sorts bl again
        // but gives us a sorted whitelist too (by matched index instead of alphabetically)!
        for (const w of bl) {
            const index0 = tmp.findIndex(v => v == w);
            const index1 = bl.findIndex(v => v == w);

            [wl[index0], wl[index1]] = [wl[index1], wl[index0]];
            [tmp[index0], tmp[index1]] = [tmp[index1], tmp[index0]];
        }

        this.blacklist = bl;
        this.whitelist = wl;
        return this;
    }

    /**
     * Finds a filtered word within a message, or a list of words if `findAll` is specified.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @returns Single: The word found or null
     * @returns findAll: An array of words found (can be empty)
     */
    find(message: string, findAll?: boolean): string[] {
        let allSwears: string[] = [];
        message = message.toLowerCase();

        for (let i = 0; i < this.blacklist.length; i++) {
            const blackWord = this.blacklist[i];

            if (message.indexOf(blackWord) > -1) {
                const countBlack = (message.match(new RegExp(blackWord.replace("*", "\*"), "g")) || []).length;
                let countWhite = 0;

                this.whitelist[i].split(",").forEach(wword => {
                    if (wword != "")
                        countWhite += (message.match(new RegExp(wword, "g")) || []).length;
                });

                if (countBlack > countWhite) {
                    if (!findAll)
                        return [blackWord];
                    allSwears.push(blackWord);
                }
            }
        }

        if (findAll)
            return allSwears;
        else
            return [];
    }

    /**
     * Finds a filtered word within a message, or a list of words if `findAll` is specified.
     * Returns both the word(s) as a string and its/their index in the string.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @returns Single: An object containing the word and its index, or null
     * @returns findAll: A list of objects
     */
    findWithIndex(message: string, findAll?: boolean): { word: string, index: number }[] {
        let allWords: { word: string, index: number }[] = [];
        message = message.toLowerCase();

        for (let i = 0; i < this.blacklist.length; i++) {
            const blackWord = this.blacklist[i];

            if (message.indexOf(blackWord) > -1) {
                // Find all indexes of each blacklisted word
                let blackVal: RegExpMatchArray[] = [];
                let flag = false;
                let sub = message;
                let index = 0;

                while (1) {
                    // Find next word + remove it from sub
                    sub = flag ? sub.substr(0, index) + " ".repeat(blackWord.length)
                        + sub.substr(index + blackWord.length) : message;
                    const black = sub.match(new RegExp(blackWord.replace("*", "\*")));

                    flag = true;

                    if (!black) break;
                    else {
                        index = black.index!;
                        blackVal.push(black);
                    }
                }

                // Find all indexes of each whitelisted word
                let whiteVal: RegExpMatchArray[] = [];
                this.whitelist[i].split(",").forEach(whiteWord => {
                    if (whiteWord != "") {
                        flag = false;
                        sub = message;
                        index = 0;

                        while (1) {
                            // Find next word + remove it from sub
                            sub = flag ? sub.substr(0, index) + " ".repeat(whiteWord.length) + sub.substr(index + whiteWord.length) : message;
                            const white = sub.match(new RegExp(whiteWord));

                            flag = true;

                            if (!white) break;
                            else {
                                index = white.index!;
                                whiteVal.push(white);
                            }
                        }
                    }
                });

                // Only keep un-whitelisted words
                // by comparing which ones were found in the whitelist
                // and which only in the blacklist
                const whiteNums = whiteVal.map(v => v.index);
                const word = blackVal.filter(v => whiteNums.findIndex(w => w == v.index) == -1)
                    .map(v => { return { word: v.toString(), index: v.index! } });

                // Return or add to word list
                if (blackVal.length > whiteVal.length) {
                    if (!findAll)
                        return [word[0]];
                    for (const w of word)
                        allWords.push(w);
                }
            }
        }

        if (findAll)
            return allWords;
        else
            return [];
    }

    /**
     * Strict mode -- matches exact space-separated words only, and the whitelist is not used here!
     * Finds a filtered word within a message, or a list of words if `findAll` is specified.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @returns Single: The word found or null
     * @returns findAll: An array of words found (can be empty)
     */
    findStrict(message: string, findAll?: boolean): string[] {
        const split = message.split(' ');
        let allSwears: string[] = [];
        message = message.toLowerCase();

        for (let i = 0; i < this.blacklist.length; i++) {
            const blackWord = this.blacklist[i];

            if (split.indexOf(blackWord) > -1) {
                if (!findAll)
                    return [blackWord];
                allSwears.push(blackWord);
            }
        }

        if (findAll)
            return allSwears;
        else
            return [];
    }

    /**
     * Strict mode -- matches exact space-separated words only, and the whitelist is not used here!
     * Finds a filtered word within a message, or a list of words if `findAll` is specified.
     * Returns both the word(s) as a string and its/their index in the string.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @returns Single: An object containing the word and its index, or null
     * @returns findAll: A list of objects
     */
    findWithIndexStrict(message: string, findAll?: boolean): { word: string, index: number }[] {
        const split = message.split(' ');
        let allWords: { word: string, index: number }[] = [];
        message = message.toLowerCase();

        for (let i = 0; i < this.blacklist.length; i++) {
            const blackWord = this.blacklist[i];

            if (split.indexOf(blackWord) > -1) {
                // Find all indexes of each blacklisted word
                let blackVal: RegExpMatchArray[] = [];
                let flag = false;
                let sub = message;
                let index = 0;

                while (1) {
                    // Find next word + remove it from sub
                    sub = flag ? sub.substr(0, index) + " ".repeat(blackWord.length)
                        + sub.substr(index + blackWord.length) : message;
                    const black = sub.match(new RegExp("\\b" + blackWord.replace("*", "\*") + "\\b"));

                    flag = true;

                    if (!black) break;
                    else {
                        index = black.index!;
                        blackVal.push(black);
                    }
                }

                const word = blackVal.map(v => { return { word: v.toString(), index: v.index! } });

                // Return or add to word list
                if (!findAll)
                    return [word[0]];
                for (const w of word)
                    allWords.push(w);
            }
        }

        if (findAll)
            return allWords;
        else
            return [];
    }

    /**
     * Finds and replaces a filtered word within a message, or all filtered words if `findAll` is specified.
     * Returns the message with filtered words replaced by `replaceChar`.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @param replaceChar Character to replace words with. Defaults to an asterisk (*).
     * If unspecified, removes found words instead
     * @returns The message with filtered words censored or removed
     */
    censor(message: string, findAll?: boolean, replaceChar?: string): string {
        let words = this.findWithIndex(message.toLowerCase(), findAll);
        return this.doCensor(words, message, findAll, replaceChar);
    }

    /**
     * Strict mode -- matches exact space-separated words only, and the whitelist is not used here!
     * Finds and replaces a filtered word within a message, or all filtered words if `findAll` is specified.
     * Returns the message with filtered words replaced by `replaceChar`.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @param replaceChar Character to replace words with. Defaults to an asterisk (*).
     * If unspecified, removes found words instead
     * @returns The message with filtered words censored or removed
     */
    censorStrict(message: string, findAll?: boolean, replaceChar?: string): string {
        let words = this.findWithIndexStrict(message.toLowerCase(), findAll);
        return this.doCensor(words, message, findAll, replaceChar);
    }

    private doCensor(words: { word: string; index: number; }[], message: string, findAll?: boolean, replaceChar?: string) {
        let censored = "";

        // Empty array = no swear found, exit
        if (words.length == 0)
            return message;

        // Sort by index, so that we can easily replace words
        words.sort((a, b) => {
            return a.index - b.index;
        });

        // Go through every word of the message and check if it's blacklisted
        // (to find the full word: hey -> heya)
        // If not, append that word to the final text
        // i: index of next space in message (to go through each word)
        // j: current index in message (to match with word.index)
        // k: index of next found filtered word (to match with j)
        message += ' '; // to find the last word too
        for (let i = message.indexOf(' '), j = 0, k = 0; i != -1;) {
            const sub = message.substr(0, i);
            const word = words[k];

            // Append everything once all words have been censored
            if (k >= words.length) {
                censored += sub + ' ';
                message = message.substr(i + 1);
                i = message.indexOf(' ');
                continue;
            }

            // Censor
            if (j == word.index || (j < word.index && j + sub.length > word.index)) {
                censored += (replaceChar ? replaceChar.repeat(sub.length) + ' ' : '');
                k++;
            }
            // Append uncensored
            else
                censored += sub + ' ';

            // Next word
            message = message.substr(i + 1);
            i = message.indexOf(' ');
            j += sub.length + 1;
        }

        return censored.trimRight(); // The space we introduced earlier
    }

    /**
     * Checks if a message gets caught by the current filter.
     * @param message The string to test
     * @returns true if the message gets filtered, false if it's clean
     */
    test(message: string): boolean {
        return this.find(message).length !== 0;
    }

    /**
     * Strict mode -- matches exact space-separated words only, and the whitelist is not used here!
     * Checks if a message gets caught by the current filter.
     * @param message The string to test
     * @returns true if the message gets filtered, false if it's clean
     */
    testStrict(message: string): boolean {
        return this.findStrict(message).length !== 0;
    }

}