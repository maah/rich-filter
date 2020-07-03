export declare class Filter {
    private blacklist;
    private whitelist;
    getBlacklist(): string[];
    getWhitelist(): string[];
    /**
     * Adds a new word to the blacklist, if `wordWhitelist` is used, link it to
     * its own whitelisted words.
     * If the word already exists, will update its whitelist instead.
     * @param word Word to blacklist
     * @param newWordWhitelist Word(s) that should be whitelisted if `word` is found
     * @returns The updated filter
     */
    addWord(word: string, wordsToWhitelist?: string | string[]): Filter;
    /**
     * Changes a blacklisted word's whitelist.
     * @param word Blacklisted word
     * @param wordsToWhitelist Word(s) that should be whitelisted
     * @returns The updated filter
     */
    editWord(word: string, wordsToWhitelist: string | string[]): Filter;
    /**
     * Removes a word from the blacklist, and its linked whitelisted words.
     * @param word Word to remove
     * @returns The updated filter
     */
    removeWord(word: string): Filter;
    /**
     * Removes all blacklisted and whitelisted words.
     * @returns The now-empty filter
     */
    reset(): Filter;
    /**
     * Returns the default blacklist and whitelist.
     * For any issue, you can still add/remove/update words.
     * @returns An example filter provided with this package
     */
    useDefault(): Filter;
    /**
     * Imports the filter from an object, overwriting the previous filter.
     * @param lists Object representing a blacklist and whitelist
     * @returns The resulting filter
     */
    from(lists: {
        blacklist: string[];
        whitelist: string[];
    }): Filter;
    /**
     * Sorts the blacklist and whitelist alphabetically without
     * messing up the index relations.
     * @returns The sorted filter, or a copy
     */
    sort(): Filter;
    /**
     * Finds a filtered word within a message, or a list of words if `findAll` is specified.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @returns Single: The word found or null
     * @returns findAll: An array of words found (can be empty)
     */
    find(message: string, findAll?: boolean): string[];
    /**
     * Finds a filtered word within a message, or a list of words if `findAll` is specified.
     * Returns both the word(s) as a string and its/their index in the string.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @returns Single: An object containing the word and its index, or null
     * @returns findAll: A list of objects
     */
    findWithIndex(message: string, findAll?: boolean): {
        word: string;
        index: number;
    }[];
    /**
     * Strict mode -- matches exact space-separated words only, and the whitelist is not used here!
     * Finds a filtered word within a message, or a list of words if `findAll` is specified.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @returns Single: The word found or null
     * @returns findAll: An array of words found (can be empty)
     */
    findStrict(message: string, findAll?: boolean): string[];
    /**
     * Strict mode -- matches exact space-separated words only, and the whitelist is not used here!
     * Finds a filtered word within a message, or a list of words if `findAll` is specified.
     * Returns both the word(s) as a string and its/their index in the string.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @returns Single: An object containing the word and its index, or null
     * @returns findAll: A list of objects
     */
    findWithIndexStrict(message: string, findAll?: boolean): {
        word: string;
        index: number;
    }[];
    /**
     * Finds and replaces a filtered word within a message, or all filtered words if `findAll` is specified.
     * Returns the message with filtered words replaced by `replaceChar`.
     * @param message The string to test
     * @param findAll If set to `true`, will return all found words
     * @param replaceChar Character to replace words with. Defaults to an asterisk (*).
     * If unspecified, removes found words instead
     * @returns The message with filtered words censored or removed
     */
    censor(message: string, findAll?: boolean, replaceChar?: string): string;
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
    censorStrict(message: string, findAll?: boolean, replaceChar?: string): string;
    private doCensor;
    /**
     * Checks if a message gets caught by the current filter.
     * @param message The string to test
     * @returns true if the message gets filtered, false if it's clean
     */
    test(message: string): boolean;
    /**
     * Strict mode -- matches exact space-separated words only, and the whitelist is not used here!
     * Checks if a message gets caught by the current filter.
     * @param message The string to test
     * @returns true if the message gets filtered, false if it's clean
     */
    testStrict(message: string): boolean;
}
