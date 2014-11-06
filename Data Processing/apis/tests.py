# -*- coding: utf-8 -*-
import unittest
from stack_overflow import StackSite

# tests
class Test_stack_api(unittest.TestCase):

    def setUp(self):
        self.StackSite = StackSite()

    def test_get_tag(self):
        df = self.StackSite.get_users_tags(cli_amount=2)
        self.assertTrue(df.shape==(200,4))




if __name__ == '__main__':
    unittest.main()