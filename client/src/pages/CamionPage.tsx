import {SetStateAction, useEffect, useState } from 'react'
import { Box,IconButton, Menu,MenuItem } from "@mui/material";
import { Add, Delete, Print, MoreVert } from '@mui/icons-material';
import CustomDataGrid from '../components/CustomDataGrid';
import { Columns } from '../types';
import {  useTheme } from "@mui/material/styles";
import { GridCellParams } from '@mui/x-data-grid';
import { editOperation, editStatus } from '../api/camion';
import Swal from 'sweetalert2';
import { Border } from '../components/Border';
import NewCamion from '../components/CreationItems/NewCamion';
const CamionPage = () => {
    const [refresh, setrefresh] = useState(false);
    const theme = useTheme()
    const [selectedRows, setSelectedRows] = useState<number[]>();
    const [selectedRow, setSelectedRow] = useState(null);
    const options = [{active: false,label:"Bloqué"}, {active: true,label:"Actif"}];
      const [item, setItem] = useState({})
    const Printaction = async () => {
    //   const pdfBlob = await pdf(<PrintModule rows={pdfinfo.rows} columns={columns} topbanner={{
    //     title: "Acheteurs"
    //   }} />).toBlob();
    //   window.open(URL.createObjectURL(pdfBlob));
    }
    const columns: Columns[] = [
        { field: "id", headerName: "Réf", type: "string", width: 100 },
        { field: "matricule", headerName: "N° matricule", type: "string", flex: 1, add: true,edit: true,},
        { field: "couleur", headerName: "Couleur", type: "string", flex: 1, add: true,edit: true,},
        {
            field: "active",
            headerName: "Etat",
            type: "string",
            editable: false,
            width: 100,
            renderCell: (params) => {
              return (
                <Box
                  sx={{
                    background:
                      params.row.active == 1 ? theme?.palette.primary.main :theme?.palette.error.main,
                    color: "#fff",
                    borderRadius: "32px",
                    display: "flex",
                    justifyContent:"center",
                    alignItems: "center",
                  }}
                >
                  {params.row.active == 1 ? "Actif":"Bloqué"}
                </Box>
              );
            },
          },
          {
            type: "actions",
            editable: false,
            renderCell: (params: GridCellParams) => {
              return (
                <>
                  <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={open ? "long-menu" : undefined}
                    aria-expanded={open ? "true" : undefined}
                    aria-haspopup="true"
                    onClick={(event) => {
                      setSelectedRow(params.row.id);
                      
                      setAnchorEl(event.currentTarget);
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                  {open && selectedRow === params.row.id && (
                    <Menu
                      id="long-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={() => {
                        setAnchorEl(null);
                      }}
                    >
                      {options
                        .filter(
                          (o) => o.active !== params.row.active
                        )
                        .map((option) => (
                          <MenuItem
                            key={option.label}
                            onClick={() => {
                              handleChangeState(params.row, option.label);
                              setAnchorEl(null);
                            }}
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                    </Menu>
                  )}
                </>
              );
            },
          },
      ];
      const handleChangeState = async(values: any, option: string) => {
        await editOperation({data: {...values, active: !values.active}}, values.id)
        .then((res) => {
          console.log(res)
          if (res.status === 200) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: `Le camion ${values.id} a bien été mis a jour`,
              showConfirmButton: false,
              timer: 1500,
            });
            setrefresh(!refresh)
          }
          else {
            Swal.fire({
              position: "center",
              icon: "error",
              title: `Le camion ${values.id} n'a pas mis a jour`,
              showConfirmButton: false,
              timer: 1500,
            });
          }
        })
        .catch((e) => {
          
            Swal.fire({
              position: "center",
              icon: "error",
              title: `Le camion ${values.id} n'a pas mis a jour`,
              showConfirmButton: false,
              timer: 1500,
            });
          
          
        })
      }
      const [openDialog, setOpenDialog] = useState(false)
      const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
      let open = Boolean(anchorEl);


  return (
      <>
      {openDialog && <NewCamion handleClose={() => setOpenDialog(false)} handleCloseUpdated={() => {
            Swal.fire({
              icon: "warning",
              title: "Are you sure?",
              text: "Your changes will not be saved!",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, discard changes!",
            }).then((result : any) => {
              if (result.isConfirmed) {
                setOpenDialog(false);
                setrefresh(!refresh);
              }
            });
          }} handleRefresh={() => setrefresh(!refresh)} open={openDialog} item={item} setItem={setItem} />}
    <Box>
        <Border
        title="Chauffeurs"
        subtitle="Visualiser, modifier ou gérer vos chauffeurs."
        actions={[
            {
                label: `Désactiver (${
                    selectedRows?.length ? selectedRows?.length : 0
                  })`,
                icon: <Delete />,
                action: () => {
                  selectedRows?.map(async (id) => {
                    await editStatus({active:false}, id)
                    .then((res) => {
                      console.log(res)
                      if (res.status === 200) {
                        Swal.fire({
                          position: "center",
                          icon: "success",
                          title: `${res.data.last_name ?? "chauffeur"} a bien été désactivé`,
                          showConfirmButton: false,
                          timer: 1500,
                        });
                        setrefresh(!refresh)
                      }
                      else {
                        Swal.fire({
                          position: "center",
                          icon: "error",
                          title: `${res.data.last_name ?? "chauffeur"} n'a pas été désactivé`,
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      }
                    })
                    .catch((e) => {
                      console.log(e)
                        Swal.fire({
                          position: "center",
                          icon: "error",
                          title: `chauffeur n'a pas été désactivé`,
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      
                      
                    })
                  })
                },
                ButtonProps: {
                  variant: "outlined",
                  color: "error",
                },
            },
            {
              label: "Impression",
              icon: <Print />,
              action: Printaction,
              ButtonProps: {
                variant: "outlined",
                color: "inherit",
              },
            },
          {
            label: "Ajouter un chauffeur",
            icon: <Add />,
            action: () => {
                setItem({})
              setOpenDialog(!openDialog)
            },
            ButtonProps: {
              variant: "contained",
              color: "primary",
            },
          }
        ]}
      />
      <Box sx={{ height: 450 }}>
        <CustomDataGrid
          selectionModel={selectedRows}
          onRowSelectionModelChange={(newRowSelectionModel: SetStateAction<number[] | undefined>) => {
            setSelectedRows(newRowSelectionModel);
          }}
          onCellDoubleClick={(params: GridCellParams) => {
            console.log(params.row)
            setItem(params.row)
            setOpenDialog(true)
          }}
          checkboxSelection
          refreshParent={refresh}
          fetchurl={`/user?populate=*&filters[idRole][$eq]=1&sort=id:ASC`}
          columns={columns}
          sx={{
            fontSize: 12,
          }}
        />
      </Box>
       
    </Box>
      </>
  )
}

export default CamionPage;