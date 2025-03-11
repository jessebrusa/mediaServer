import os
import re
from rename_numbers_base import RenameNumbersBase

class RenameSeasonNumbers(RenameNumbersBase):
    def extract_number(self, filename):
        match = re.search(r's(\d+)', filename)
        if match:
            return int(match.group(1))
        return float('inf')
    
    def rename_file(self, filename):
        season_number = self.extract_number(filename)
        new_season_number = season_number - self.difference
        new_season_number_str = f's{new_season_number:02d}'
        new_filename = re.sub(r's\d+', new_season_number_str, filename)
        new_filepath = os.path.join(self.directory, new_filename)
        if not os.path.exists(new_filepath):
            os.rename(os.path.join(self.directory, filename), new_filepath)
            print(f'{filename} -> {new_filename}')
        else:
            print(f'Skipping {filename} -> {new_filename} (file already exists)')

if __name__ == "__main__":
    RenameSeasonNumbers(2).rename()