import nltk
from nltk.stem.porter import PorterStemmer
from nltk.stem import WordNetLemmatizer


def lemmatize(word):

    lemmatizer = WordNetLemmatizer()
    word = word.lower()
    word = lemmatizer.lemmatize(word)
    return word


def stem(word):

    stemmer = PorterStemmer()
    return stemmer.stem(word.lower())


def tokenize(string):
    
    return nltk.word_tokenize(string)