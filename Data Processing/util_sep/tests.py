import unittest
from xml_dataframe import xml2df
from process_stack_xml import ConvertFiles
from glob import glob


# tests
class Test_xml2df(unittest.TestCase):

    def setUp(self):
        f_name = '../../Data/Tags.xml'
        self.df = xml2df(f_name)

    def test_len(self):
        self.assertTrue(self.df.shape[0] == 36942)

    def test_shape(self):
        self.assertTrue(self.df.shape == (36942, 5))

class Test_Process(unittest.TestCase):

    def setUp(self):
        f_name = '../../Data/Users.xml'
        self.cf = ConvertFiles(f_name)

    def test_return(self):
        ret = self.cf.split_files_by_year()
        self.assertTrue(ret == (2008, 2014))

        l = len(glob('../../Data/Users*.xml'))
        self.assertTrue( l == 8)

if __name__ == '__main__':
    unittest.main()