import pandas as pd
import sys


if len(sys.argv) - 1 > 1:
    print("Invalid number of arguments. Please use only one argument.")
    sys.exit()

file_name = sys.argv[1]

df = pd.read_csv(file_name)
json_file = df.to_json()
