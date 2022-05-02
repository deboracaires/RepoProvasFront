import { Button, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/Form";
import useAlert from "../hooks/useAlert";
import useAuth from "../hooks/useAuth";
import api, { Category, CreateTest, DisciplineWithoutTeacher, Teacher } from "../services/api";

const styles = {
  input: {
    marginBottom: "16px",
    width: "52vw"
  },
  select: {
    marginBottom: "16px",
    width: "52vw",
    color: '#000'
  }
}

function AddTest () {

  const [termTitle, setTermTitle] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineWithoutTeacher>();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher>();
  const [toggleSelect, setToggleSelect] = useState<boolean>(true);

  const navigate = useNavigate();

  const { token } = useAuth();

  const { setMessage } = useAlert();

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (termTitle.length === 0 || pdfUrl.length === 0 || !selectedCategory || !selectedDiscipline || !selectedTeacher) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios!" })
    }else if (!token) {
      setMessage({ type: "error", text: "Login expirado, tente logar novamente!" });
    } else {
      const body: CreateTest = {name: termTitle, pdfUrl, categoryId: selectedCategory.id, teacherDisciplineId: selectedTeacher.id};
      try {
        await api.createTest(token, body);
        setMessage({ type: "success", text: "Teste cadastrado!" });
        navigate('/app/disciplinas');
      } catch (err) {
        setMessage({ type: "error", text: 'ops algo deu errado' });
      }
    }
  }

  return (
    <>
      <Typography variant='h5' align='center' sx={{ marginBottom: "35px" }} > Adicione uma prova </Typography>
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="contained" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
      </Box>
      <Form onSubmit={handleSubmit}>
        <TextField 
          sx={styles.input}
          type='text'
          label='Título da Prova'
          value={termTitle}
          onChange={(e) => setTermTitle(e.target.value)}
        >  
        </TextField>
        <TextField 
          sx={styles.input}
          type='text'
          label='PDF da Prova'
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
        >  
        </TextField>
        <Categories 
          setSelectedCategory={setSelectedCategory}
        />
        <Disciplines 
          setSelectedDiscipline={setSelectedDiscipline} 
          setToggleSelect={setToggleSelect}
        />
        <Teachers 
          setSelectedTeacher={setSelectedTeacher} 
          selectedDiscipline={selectedDiscipline} 
          toggleSelect={toggleSelect} 
        />
        <Button variant='contained' sx={styles.input} type='submit'>Enviar</Button>
      </Form>
    </>
  )
}

function Categories ({ setSelectedCategory }: any) {
  
  const [category, setCategory] = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  async function handleCategory(event: any) {
    setCategory(event.target.value);
    setSelectedCategory(event.target.value);
  }

  const { token } = useAuth();

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: categoriesData } = await api.getCategories(token);
      setAllCategories(categoriesData.categories);
    }
    loadPage();
  }, [token]);
  
  return (
    <FormControl sx={{
      alignItems: "center"}}>
      <InputLabel id="select-category-label" sx={{alignItems: "center"}}>Categoria</InputLabel>
      <Select
        labelId="select-category-label"
        id="select-category"
        value={category}
        label="Categoria"
        onChange={handleCategory}
        sx={styles.select}
      >
        {allCategories.map((category: any, index: any) => <MenuItem value={category} key={index}>{category.name}</MenuItem>)}
      </Select>
    </FormControl>
  )
}

function Disciplines ({ setSelectedDiscipline, setToggleSelect }: any) {
  const [discipline, setDiscipline] = useState('');
  const [allDisciplines, setAllDisciplines] = useState<DisciplineWithoutTeacher[]>([]);

  const { token } = useAuth();

  async function handleDiscipline(event: any) {
    setDiscipline(event.target.value);
    setSelectedDiscipline(event.target.value);
    setToggleSelect(false);
  }

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: disciplinesData } = await api.getDisciplines(token);
      setAllDisciplines(disciplinesData.disciplines);
    }
    loadPage();
  }, [token]);
  return (
    <FormControl sx={{
      alignItems: "center"}}>
      <InputLabel id="select-discipline-label" sx={{alignItems: "center"}}>Disciplina</InputLabel>
      <Select
        labelId="select-discipline-label"
        id="select-discipline"
        value={discipline}
        label="Disciplina"
        onChange={handleDiscipline}
        sx={styles.select}
      >
        {allDisciplines.map((discipline: any, index: any) => <MenuItem value={discipline} key={index}>{discipline.name}</MenuItem>)}
      </Select>
    </FormControl>
  )
}

function Teachers ({ setSelectedTeacher, selectedDiscipline, toggleSelect }: any) {
  
  const [teacher, setTeacher] = useState('');
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);

  const { token } = useAuth();

  async function handleTeacher(event: any) {
    setTeacher(event.target.value);
    setSelectedTeacher(event.target.value);
  }

  useEffect(() => {
    async function loadPage() {
      if (!token) return;
      if (selectedDiscipline) {
        const { data: teachersData } = await api.getTeachers(token, Number(selectedDiscipline.id));
        setAllTeachers(teachersData.teachers);
      }
      
    }
    loadPage();
  }, [token, selectedDiscipline]);


  return (
    <FormControl sx={{
      alignItems: "center"}}>
      <InputLabel id="select-teacher-label" sx={{alignItems: "center"}}>Instrutor</InputLabel>
      <Select
        labelId="select-teacher-label"
        id="select-teacher"
        value={teacher}
        label="Instrutor"
        onChange={handleTeacher}
        sx={styles.select}
        disabled={toggleSelect}
      >
        {allTeachers.map((teacher: any, index: any) => <MenuItem value={teacher} key={index}>{teacher.teacher.name}</MenuItem>)}
      </Select>
    </FormControl>
  );
}

export default AddTest;