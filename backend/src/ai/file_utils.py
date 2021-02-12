"""
This file contains various utility functions for working with data.
"""

import pandas as pd


def import_csv(file_name):
    
    file_data = pd.read_csv(file_name)
    print(file_data)

    group = file_data.groupby('entity')
    df2 = group.apply(lambda x: x['patterns'].unique())

    print(df2)

    df3 = df2.to_dict()
    print(df3)
    