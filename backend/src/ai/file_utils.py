"""
This file contains various utility functions for working with data.
"""

import pandas as pd


def import_csv(file_name):
    
    file_data = pd.read_csv(file_name)
    