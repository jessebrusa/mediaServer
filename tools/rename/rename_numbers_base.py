from tkinter import filedialog
import os

class RenameNumbersBase:
    def __init__(self, startNumber=1):
        self.startNumber = startNumber
        self.directory = None
        self.files = []
        self.difference = 0

    def rename(self):
        self.select_directory()
        self.collect_files()
        self.calculate_difference()
        for file in self.files:
            self.rename_file(file)

    def select_directory(self):
        self.directory = filedialog.askdirectory()
    
    def collect_files(self):
        self.files = []
        for file in os.listdir(self.directory):
            self.files.append(file)
        
        self.files.sort(key=self.extract_number)
        print(self.files)

    def extract_number(self, filename):
        raise NotImplementedError("Subclasses should implement this method")

    def calculate_difference(self):
        self.difference = self.extract_number(self.files[0]) - self.startNumber
        if self.difference < 0:
            self.files.reverse()
    
    def rename_file(self, filename):
        raise NotImplementedError("Subclasses should implement this method")