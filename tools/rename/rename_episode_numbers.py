import os
import re
from rename_numbers_base import RenameNumbersBase

class RenameEpisodeNumbers(RenameNumbersBase):
    def extract_number(self, filename):
        match = re.search(r'e(\d+)', filename)
        if match:
            return int(match.group(1))
        return float('inf')
    
    def rename_file(self, filename):
        episode_number = self.extract_number(filename)
        new_episode_number = episode_number - self.difference
        new_episode_number_str = f'e{new_episode_number:02d}'
        new_filename = re.sub(r'e\d+', new_episode_number_str, filename)
        new_filepath = os.path.join(self.directory, new_filename)
        if not os.path.exists(new_filepath):
            os.rename(os.path.join(self.directory, filename), new_filepath)
            print(f'{filename} -> {new_filename}')
        else:
            print(f'Skipping {filename} -> {new_filename} (file already exists)')

if __name__ == "__main__":
    RenameEpisodeNumbers().rename()