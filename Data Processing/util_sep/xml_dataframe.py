# Code got from http://rexdouglass.com/parsing-xml-files-to-a-flat-dataframe/
#
# Modified his role code
# http://stackoverflow.com/questions/4071696/python-beautifulsoup-xml-parsing

from xml.etree import ElementTree
import pandas as pd
 
def xml2df(xml_doc):
    f = open(xml_doc, 'r')
    attr_list = []

    tree = ElementTree.parse(f)
    for node in tree.iter('row'):
         attr_list.append(dict(zip(node.attrib.keys(), node.attrib.values())))

    df=pd.DataFrame(attr_list)
    #df.dropna(how='all')

    return df



# Main Function
if __name__ == '__main__':
    f_name = '../../Data/Users.xml'
    df = xml2df(f_name)
    print df.shape
