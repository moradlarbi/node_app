import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box/Box";
import {
  Button,
  DialogActions,
  DialogContent,
  Dialog,
  DialogTitle,
  TextField,
  InputAdornment,
  Typography,
  Switch
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, SubmitHandler, FieldErrors } from "react-hook-form";
import { date, object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addOperation, editOperation } from "../../api/driver";
import Swal from "sweetalert2";
import moment from "moment";

const registerSchema = object({
  last_name: string().nonempty("Le nom est obligatoire"),
  first_name: string().nonempty("Le prénom est obligatoire"),
  email: string().nonempty("L'email est obligatoire"),
  password: string().nonempty("Le mot de passe est obligatoire"),
  numPermis: string().nonempty("Le numero de permis est obligatoire"),

});

type RegisterInput = TypeOf<typeof registerSchema>;

const fields = [
  { field: "last_name", headerName: "Nom", type: "string", add: true, edit: true, required: true },
  { field: "first_name", headerName: "Prénom", type: "string", add: true, edit: true, required: true },
  { field: "email", headerName: "Email", type: "string", add: true, edit: true, required: true },
  { field: "password", headerName: "Mot de passe", type: "password", add: true, edit: true, required: true },
  { field: "numPermis", headerName: "N° Permis", type: "number", add: true, edit: true, required: true },
  { field: "date_begin", headerName: "Date du début", type: "date", add: true, edit: true },
  {
    field: "sexe",
    headerName: "Genre",
    type: "checkbox",
  },
  {
    field: "active",
    headerName: "Etat",
    type: "checkbox",
  },
];

interface NewDriverProps {
  open: boolean;
  handleClose: () => void;
  handleCloseUpdated: () => void;
  handleRefresh: () => void;
  item: any;
  setItem: React.Dispatch<React.SetStateAction<any>>;
}

const NewDriver: React.FC<NewDriverProps> = ({ open, handleClose, handleCloseUpdated, handleRefresh, item, setItem }) => {
  const [checked, setChecked] = useState(false);
  const [checkedSexe, setCheckedSexe] = useState(false);
  const [fieldsChanged, setFieldsChanged] = useState(false);

  const addOne = async (values: RegisterInput) => {
    let nom = values.last_name;
    let newValues = { ...values, idRole: 1, active: !checked, sexe: checkedSexe };
    console.log(newValues);

    await addOperation({...newValues})
      .then((res) => {
        console.log(res);
        if (res.status === 201) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: `${nom} a bien été ajouté`,
            showConfirmButton: false,
            timer: 1500,
          });
          handleRefresh();
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: `${nom} n'a pas été ajouté`,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      })
      .catch((e) => {
        console.log(e);
        Swal.fire({
          position: "center",
          icon: "error",
          title: `${nom} n'a pas été ajouté`,
          showConfirmButton: false,
          timer: 1500,
        });
      });
  };

  const editOne = async (values: any) => {
    console.log(values);
    await editOperation({...values}, values.id)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: `${values.last_name} a bien été mis a jour`,
            showConfirmButton: false,
            timer: 1500,
          });
          handleRefresh();
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            title: `${values.last_name} n'a pas mis a jour`,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      })
      .catch((e) => {
        Swal.fire({
          position: "center",
          icon: "error",
          title: `${values.last_name} n'a pas mis a jour`,
          showConfirmButton: false,
          timer: 1500,
        });
      });
  };

  const {
    register,
    formState: { errors, isSubmitSuccessful },
    reset,
    handleSubmit,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const onSubmitHandler: SubmitHandler<RegisterInput> = (values) => {
    if (Object.keys(errors).length === 0) {
      addOne(values);
      console.log(values)
      handleClose();
    }
  };

  const handleSubmitEdit = () => {
    console.log(item);
    editOne(item);
    handleClose();
  };

  const [refresh, setRefresh] = useState(false);
  const handleChangeUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.type === "number") {
      setItem({ ...item, [event.target.name]: Number(event.target.value) });
    } else {
      setItem({ ...item, [event.target.name]: event.target.value });
    }
    setFieldsChanged(true);
    setRefresh(!refresh);
  };

  useEffect(() => {}, [item]);

  return (
    <Dialog open={open} onClose={fieldsChanged ? handleCloseUpdated : handleClose} maxWidth={false}>
      {Object.keys(item).length === 0 ? (
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmitHandler)}>
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
            id="alert-dialog-title"
          >
            <Box>
              <Typography sx={{ mt: 2 }} variant="h1" color={"primary.main"}>
                fiche Chauffeur
              </Typography>
              <Typography sx={{ pt: 2 }} variant="h3" color={"secondary"}>
                Fiche chauffeur : créer un chauffeur .
              </Typography>
            </Box>
            <CloseIcon onClick={handleClose} sx={{ cursor: "pointer" }} />
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 10px", marginTop: "10px", minWidth: 500 }}
            >
              {fields.filter((c) => c.add).map((col) => (
                <TextField
                  key={col.field}
                  fullWidth
                  label={col.headerName}
                  type={col.type}
                  {...register(col.field as keyof RegisterInput)}
                  required={col.required}
                  error={!!(errors as FieldErrors<RegisterInput>)[col.field as keyof RegisterInput]}
                  helperText={(errors as FieldErrors<RegisterInput>)[col.field as keyof RegisterInput]?.message}
                  InputProps={{
                    endAdornment: <InputAdornment position="start"></InputAdornment>,
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Typography>Genre</Typography>
              <Switch
                checked={checkedSexe}
                onChange={(e) => setCheckedSexe(e.target.checked)}
                inputProps={{ "aria-label": "controlled" }}
                sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
              />
              <Typography>{checkedSexe ? 'Homme' : 'Femme'}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Typography>En sommeil</Typography>
              <Switch
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                inputProps={{ "aria-label": "controlled" }}
                sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button variant="contained" type="submit">
              Enregistrer
            </Button>
          </DialogActions>
        </Box>
      ) : (
        <Box component="form">
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
            id="alert-dialog-title"
          >
            <Box>
              <Typography sx={{ mt: 2 }} variant="h1" color={"primary.main"}>
                fiche Chauffeur
              </Typography>
              <Typography sx={{ pt: 2 }} variant="h3" color={"secondary"}>
                Fiche chauffeur : mettre a jour un chauffeur .
              </Typography>
            </Box>
            <CloseIcon onClick={fieldsChanged ? handleCloseUpdated : handleClose} sx={{ cursor: "pointer" }} />
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 10px", marginTop: "10px", minWidth: 500 }}
            >
              {fields.filter((c) => c.edit && c.type !=="password").map((col) => (
                <TextField
                  key={col.field}
                  fullWidth
                  label={col.headerName}
                  type={col.type}
                  value={col.type =="date" ? moment(item[col.field]).format('YYYY-MM-DD'): item[col.field]}
                  name={col.field}
                  onChange={handleChangeUpdate}
                  required={col.required}
                  InputProps={{
                    endAdornment: <InputAdornment position="start"></InputAdornment>,
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Typography>Genre</Typography>
              <Switch
                checked={item.sexe}
                onChange={(e) => {
                  setItem({ ...item, sexe: e.target.checked });
                  setRefresh(!refresh);
                }}
                inputProps={{ "aria-label": "controlled" }}
                sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
              />
              <Typography>{item.sexe ? 'Homme' : 'Femme'}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Typography>En sommeil</Typography>
              <Switch
                checked={!item.active}
                onChange={(e) => {
                  setItem({ ...item, active: !e.target.checked });
                  setRefresh(!refresh);
                }}
                inputProps={{ "aria-label": "controlled" }}
                sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={fieldsChanged ? handleCloseUpdated : handleClose}>Annuler</Button>
            <Button variant="contained" type="submit" onClick={handleSubmitEdit}>
              Mettre a jour
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
};

export default NewDriver;
