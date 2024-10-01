// src/pages/Dashboard.js


import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Box,
  Breadcrumbs,
  Link,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateFileNodeModel from '../components/UpdateFileNodeModel';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SearchIcon from '@mui/icons-material/Search';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentNode, setCurrentNode] = useState([]);
  const [path, setPath] = useState(['inicio']);

  const handleOpen = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleDelete = (id) => {
    alert(`Delete user with ID: ${id}`);
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `http://localhost:8080/api/filesystem/?page=${page}&size=${rowsPerPage}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setRows(data.content);
      setTotalElements(data.page.totalElements); 
      setTotalPages(data.page.totalPages);
    } catch (error) {
      console.error('Error', error);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchNodeByName = useCallback(async (name) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `http://localhost:8080/api/filesystem/getByname?name=${name}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data.fileNode;
      setCurrentNode(data.childNode);
      setPath((prevPath) => [...prevPath.slice(0, -1), data.name]);
    } catch (error) {
      console.error('', error);
    }
  }, []);

  const handleDirectoryClick = (node) => {
    if (node.childNode.length > 0) {
      fetchNodeByName(node.name);
      setPath((prevPath) => [...prevPath, node.name]);
    }
  };

  const handleBreadcrumbClick = (crumb) => {
    const index = path.indexOf(crumb);
    const newPath = path.slice(0, index + 1);
    if (crumb === 'inicio') {
      fetchData();
      setCurrentNode([]);
      setPath(['inicio']);
    } else {
      const nameToFetch = newPath[newPath.length - 1];
      fetchNodeByName(nameToFetch);
      setPath(newPath);
    }
  };

  const filteredRows = rows.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); 
    setPage(0); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 2,
          padding: 1,
          marginBottom: 2,
          width: '80%',
          textAlign: 'center',
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          {path.map((crumb, index) => (
            <Link
              key={index}
              onClick={() => handleBreadcrumbClick(crumb)}
              style={{ cursor: 'pointer', color: '#1976d2' }}
            >
              {crumb}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      <Box sx={{ position: 'relative', width: '80%', textAlign: 'right', marginBottom: 2 }}>
        <IconButton>
          <SearchIcon />
        </IconButton>
        <TextField
          variant="outlined"
          size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginLeft: 1, width: '150px', position: 'absolute', right: 0 }}
          placeholder="Search..."
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          margin: '0 auto',
          maxWidth: '80%',
          marginBottom: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(currentNode.length ? currentNode : filteredRows).map((row) => (
              <TableRow key={row.id}>
                <TableCell align="center">
                  <Box display="flex" alignItems="center" justifyContent="center">
                    {row.isDirectory ? (
                      <FolderIcon
                        style={{ marginRight: 8, cursor: 'pointer' }}
                        onClick={() => handleDirectoryClick(row)}
                      />
                    ) : (
                      <InsertDriveFileIcon style={{ marginRight: 8 }} />
                    )}
                    {row.isDirectory ? (
                      <Link onClick={() => handleDirectoryClick(row)}>{row.name}</Link>
                    ) : (
                      row.name
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">{row.isDirectory ? 'Folder' : 'File'}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpen(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]} 
        component="div"
        count={totalElements} 
        rowsPerPage={rowsPerPage} 
        page={page} 
        onPageChange={handlePageChange} 
        onRowsPerPageChange={handleRowsPerPageChange} 
      />

      <Box sx={{ textAlign: 'center', marginTop: 1 }}>
        Page {page + 1} of {totalPages} {console.log(totalPages)}
      </Box>

      <UpdateFileNodeModel
        open={open}
        handleClose={handleClose}
        selectedRow={selectedRow}
      />
    </div>
  );
};

export default Dashboard;
