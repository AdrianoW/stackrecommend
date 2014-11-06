import subprocess
from xml.etree import ElementTree
from util import dprint
from os.path import basename, abspath
from time import sleep
from pandas import DataFrame
from bs4 import BeautifulSoup
from multiprocessing import Pool
import csv
from lxml import etree
import sys, traceback
import pandas as pd
from os import remove

FIELDS = []
FIELD_SEP = ','

class ConvertFiles():
    '''
    Handles the xml file conversion
    '''

    def __init__(self, file_name, verbose=True):
        '''
        Holds the filename

            file_name(str): file name with dir of the file that is going to be
                converted
        '''
        self.file_name = file_name
        self.verbose= verbose

    def split_files_by_year(self):
        '''
        Get the file and split it by year. Get the first line  year and the
        last line year as delta. Uses tail to do that
        '''
        # get the first 3 lines
        head = subprocess.Popen(["head", "-n 3", self.file_name],
                                stdout=subprocess.PIPE).communicate()[0]
        end = subprocess.Popen(["tail", "-n 2", self.file_name],
                                stdout=subprocess.PIPE).communicate()[0]

        dic_list = []
        xml = ElementTree.fromstring(head+end)
        for node in xml.iter('row'):
            dic_list.append(dict(zip(node.attrib.keys(), node.attrib.values())))

        # get only the year of the string 2008-01-01
        start_date = int(dic_list[0]['CreationDate'][0:4])
        end_date = int(dic_list[1]['CreationDate'][0:4])

        # file name we are reading
        base = basename(self.file_name)

        # for each of the years create a file and cat the content there
        process = []
        out_list = []
        num_processes = 0
        for y in range(start_date, end_date+1):
            out = base.replace('.', '{}.'.format(y))
            out = abspath(self.file_name).replace(base, out)
            f_out = open(out, 'w')
            out_list.append(f_out)
            dprint('Processing years {}'.format(y))
            process.append(subprocess.Popen(['egrep',
                                             'CreationDate="{}'.format(y),
                                             self.file_name], stdout=f_out))
            #f_out.write(head.split('\n')[0])
            #f_out.write(head.split('\n')[1])
            num_processes += 1

        # check if the processes are finished
        while True:
            num_finished = 0
            for p in process:
                if p.poll() == 0:
                    num_finished += 1
            if num_finished == num_processes:
                break

            # give the processor some breathing time
            sleep(5)

        # close files
        for o in out_list:
            o.close()

        dprint('Finished creating {} files'.format(num_processes))

        return (start_date, end_date)

    def read_xml_lines(self, line_num=10000, partial_file=None):
        '''
        Read  line_num lines for a xml file. Uses header_file to get the header
        and create a string that can be parsed by the xml.tree

        : file_name(string): file to read, with directories
        : header_file(string): file with directory that will have the header read
        : line(int, optional): number of lines to read
        '''
        # read the header string
        file_name = self.file_name
        xml_str = []
        count = -2
        header = ''
        if partial_file:
            with open(self.file_name, 'r') as f:
                xml_str.append(f.next())
                xml_str.append(f.next())
            file_name = partial_file
            count = 0

        # read the file, create the xml
        with open(file_name, 'r') as f:
            for line in f:
                # check if should put a line
                if count == 0 and header== '':
                    # as it is the first time, save the header
                    header = xml_str[0:2]
                xml_str.append(line)
                count +=1

                # check if the lines are fetched already
                if count>=line_num:

                    # close the xml
                    xml_str.append(header[1].replace('<', '</'))

                    df = self.xml_to_df(xml_str)

                    # TODO: check the kind of errors I am having
                    if df!=None:
                        yield df
                    count = 0
                    del(xml_str)
                    xml_str = []
                    xml_str.append(header[0])
                    xml_str.append(header[1])

            if count>0:
                # close the xml
                xml_str.append(header[1].replace('<', '</'))

                df = self.xml_to_df(xml_str)
                # TODO: check the kind of errors I am having
                if df!=None:
                    yield df

        return

    def xml_to_df(self, xml_str):
        '''
        Transforms the xml in a string into a data frame

        : xml_str(str): string with the xml to be transformed in dataframe
        '''
        # convert to dataframe
        attr_list = []
        try:
            tree = ElementTree.fromstringlist(xml_str)
        except:
            return None

        for node in tree.iter('row'):
             attr_list.append(dict(zip(node.attrib.keys(), node.attrib.values())))

        return DataFrame(attr_list)

    def create_read_iterator(self, line_num=10000):
        '''
        Read  line_num lines for a xml file. Converts differently.

        : line(int, optional): number of lines to read. -1 read whole file
        '''
        # read the file, create the xml
        count = 0
        l = []
        with open(self.file_name, 'r') as f:
            for i,line in enumerate(f):
                try:
                    l.append(dict(BeautifulSoup(line).row.attrs))
                    count +=1
                except:
                    dprint('Error on line {}'.format(line))

                # check if the lines are fetched already
                if count>=line_num and line_num>0:
                    dprint('Processed {}'.format(i))
                    yield DataFrame(l)
                    l = []
                    count = 0

        # in case it is reading all or finished the loop in the middle
        if count != 0:
            yield DataFrame(l)

        return

    def create_simple_file(self, out_name, fields,
                           chunk_size= 100000,
                           process_num = 5,
                           all_file = False):

        # read the file, create the xml
        count = 0
        lines = 0
        data = []
        dprint('Start processing file {}'.format(self.file_name))
        with open(out_name, 'w') as out:
            with open(self.file_name, 'r') as f:
                # write the headers
                writer = csv.writer(out, delimiter=FIELD_SEP, quotechar='"')
                writer.writerow(fields)
                for i,line in enumerate(f):
                    try:
                        data.append(line)
                    except:
                        print type(line)
                        continue
                    count +=1

                    # check if the lines are fetched already
                    if count>=chunk_size:
                        if self.verbose:
                            dprint('Copied {}'.format(count))

                        lines += self.output_line(data, process_num, out)

                        # check if it is time to leave
                        if not all_file:
                            break
                        count = 0
                        del(data)
                        data = []

                # check if all the file was output
                if count>0:
                    lines += self.output_line(data, process_num, out)

        if self.verbose:
            dprint('Finished processing file {}'.format(self.file_name))
            dprint(lines)


    def output_line(self, data, process_num, output_file):
        # use multiple processors do parse them
        pool = Pool(processes=process_num)

        # Fragment the string data into 5 chunks
        partitioned_text = list(chunks(data, len(data) / process_num))

        # Generate count tuples for title-cased tokens
        simple_data = pool.map(data_line, partitioned_text)

        # write the simple file
        count = 0
        for each in simple_data:
            for a in each:
                t = '"' + ('"'+FIELD_SEP+'"').join(a) + '"\n'
                output_file.write(t.encode('ascii', errors='backslashreplace'))
                count += 1

        pool.close()
        return count

    def create_simple_posts(self, fields=None):
        '''
        Create a simpler posts files, without the content and other fields
        '''
        global FIELDS

        if not fields:
            FIELDS = ['Id', 'Title', 'ViewCount', 'CreationDate', 'OwnerUserId', 'Tags']
        else:
            FIELDS = fields

        # create a small simple file
        self.create_simple_file('../Data/Processed/SimplePosts.csv', FIELDS,
                              chunk_size=120000, process_num=6, all_file=True)


    def create_simple_users(self, fields=None):
        '''
        create a simpler user files, without the description of the user
        '''
        global FIELDS

        if not fields:
            FIELDS = ['Id','CreationDate','DisplayName','Location','Age']
        else:
            FIELDS = fields

        # create a small simple file of the users
        self.create_simple_file('../Data/Processed/SimpleUsers.csv', FIELDS,
                              chunk_size=120000, process_num=6, all_file=True)

    def create_simple_tags(self, fields=None):
        '''
        create a simpler user files, without the description of the user
        '''
        global FIELDS

        if not fields:
            FIELDS = ['Id','TagName','Count','ExcerptPostId','WikiPostId']
        else:
            FIELDS = fields

        # create a small simple file of the users
        self.create_simple_file('../Data/Processed/SimpleTags.csv', FIELDS,
                              chunk_size=120000, process_num=6, all_file=True)

    def create_simple_comments(self, fields=None):
        '''
        create a simpler user files, without the description of the user
        '''
        global FIELDS

        if not fields:
            FIELDS = ['Id','PostId','Score','UserId']
        else:
            FIELDS = fields

        # create a small simple file of the users
        self.create_simple_file('../Data/Processed/SimpleComments.csv', FIELDS,
                              chunk_size=120000, process_num=6, all_file=True)


def data_line(rows):

    """
    Convert a group of lines of the xml to a line csv style

    :returns
        list of lines (lists)
    """
    ret = []
    for rown, row in enumerate(rows):
        try:
            xml = etree.fromstring(row)
            line = []
            for field in FIELDS:
                try:
                    line.append(xml.attrib.get(field, ' ').replace('"', "'"))
                except:
                    import pdb; pdb.set_trace()
                    pass
            ret.append(line)
        except:
            traceback.print_exc(file=sys.stdout)
            pass


    return ret

def chunks(l, n):
    """
    A generator function for chopping up a given list into chunks of
    length n.
    """
    for i in xrange(0, len(l), n):
        yield l[i:i+n]

def convert_csv_to_json(input, output, verbose=True):
    # read the file using pandas. Some lines at a time
    if verbose==True:
        dprint('Reading file {}'.format(input))

    # read the file and write it
    try:
        remove(output)
    except:
        pass

    with open(output, 'w+') as out:
        for chun in pd.read_csv(input, delimiter=';', quotechar='"', chunksize=100000):
            chun.to_json(out, orient='records')

    if verbose==True:
        dprint('Finished writing {}'.format(output))


if __name__ == '__main__':
    # create the object and read a file
    # cf = ConvertFiles('../../Data/Posts2008.xml')
    # #cf.split_files_by_year()
    #
    # #ite = cf.read_xml_lines(10000, '../../Data/Posts2008.xml')
    # ite = cf.create_read_iterator()
    # dprint('Start')
    # #with open('../../Data/output.xml', 'w') as f:
    # #    head = True
    # #    for df in ite:
    # #        df.to_csv(f, header=head, index=False)
    # final = None
    # first = True
    # for i, df in enumerate(ite):
    #     if first:
    #         final = df
    #         first = not first
    #     else:
    #         # write the file to the
    #         print final.shape
    # dprint('End')
    pass