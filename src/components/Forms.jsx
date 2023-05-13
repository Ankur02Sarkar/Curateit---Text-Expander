/* global chrome */
import React, { useState, useEffect, useRef } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { TbUnlink, TbTextRecognition, TbForms } from "react-icons/tb";
import { CiTextAlignCenter } from "react-icons/ci";
import { Configuration, OpenAIApi } from "openai";

const STORAGE_FORM_PREFIX = "curateit_form_";

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const Forms = () => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [shortcuts, setShortcuts] = useState([]);
  const [displayDiv, setDisplayDiv] = useState(null);
  const [query, setQuery] = useState("");
  const [expansions, setExpansions] = useState([]);
  const [filteredExpansions, setFilteredExpansions] = useState([]);
  const [newShortcut, setNewShortcut] = useState("");
  const [newExpansion, setNewExpansion] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [forms, setForms] = useState([]);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormData, setNewFormData] = useState("");
  const [editingFormKey, setEditingFormKey] = useState(null);
  const [filteredForms, setFilteredForms] = useState([]);
  const [formQuery, setFormQuery] = useState("");
  const [citationResult, setCitationResult] = useState("");
  const [citationData, setCitationData] = useState(null);
  const [citations, setCitations] = useState([]);
  const [citeRes, setCiteRes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const listItemRef = useRef();
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  function toTitleCase(str) {
    return str
      .replace(/_/g, " ") // replace underscores with spaces
      .replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const saveCitation = (index, data) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.set(
        { [`${STORAGE_CITATION_PREFIX}${index}`]: data },
        () => {
          console.log("Citation saved.");
          fetchCitations();
        }
      );
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const copyToClipboard = (event) => {
    const range = document.createRange();
    const parentElement = event.target.parentElement; // Get the parent div of the clicked button
    range.selectNode(parentElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    setIsCopied(true);
  };

  const resetCopyState = () => {
    setIsCopied(false);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const citationStyles = [
    "AMA (American Medical Association)",
    "American Chemical Society",
    "APA 6 (American Psychological Association 6th edition)",
    "APA 7 (American Psychological Association 7th edition)",
    "Chicago Manual of Style 17th edition (author-date)",
    "Chicago Manual of Style 17th edition (full note)",
    "Council of Science Editors, Name-Year (author-date)",
    "Harvard",
    "Harvard (Australia style)",
    "IEEE",
    "MHRA (Modern Humanities Research Association - author-date)",
    "MLA 8 (Modern Language Association 8th edition)",
    "MLA 9 (Modern Language Association 9th edition)",
    "OSCOLA (Oxford University Standard for Citation of Legal Authorities)",
    "Vancouver",
    "2D Materials",
    "3 Biotech",
    "3D Printing and Additive Manufacturing",
    "3D Printing in Medicine",
    "3D Research",
    "3D-Printed Materials and Systems",
    "4OR",
    "AAPG Bulletin",
    "AAPS Open",
    "AAPS PharmSciTech",
    "Abhandlungen aus dem Mathematischen Seminar der Universität Hamburg",
    "ABI Technik (Deutsch)",
    "Academic Medicine",
    "Academic Pediatrics",
    "Academic Psychiatry",
    "Academic Questions",
    "Academy of Management Discoveries",
    "Academy of Management Journal",
    "Academy of Management Learning and Education",
    "Academy of Management Perspectives",
    "Academy of Management Proceedings",
    "Academy of Management Review",
    "Accident Analysis and Prevention",
    "Accounting Forum",
    "Accounting History Review",
    "Accounting, Organizations and Society",
    "Accounts of Chemical Research",
    "Accreditation and Quality Assurance",
    "Achievements in the Life Sciences",
    "ACI Materials Journal",
    "ACI Structural Journal",
    "ACM Computing Surveys",
    "ACM Journal on Emerging Technologies in Computing Systems",
    'ACM SIG Proceedings ("et al." for 15+ authors)',
    'ACM SIG Proceedings ("et al." for 3+ authors)',
    "ACM SIGCHI Proceedings - Extended Abstract Format",
    "ACM SIGCHI Proceedings (2016)",
    "ACM SIGGRAPH",
    "ACM Transactions on Accessible Computing",
    "ACM Transactions on Algorithms",
    "ACM Transactions on Applied Perception",
    "ACM Transactions on Architecture and Code Optimization",
    "ACM Transactions on Asian Language Information Processing",
    "ACM Transactions on Autonomous and Adaptive Systems",
    "ACM Transactions on Computation Theory",
    "ACM Transactions on Computational Logic",
    "ACM Transactions on Computer Systems",
    "ACM Transactions on Computer-Human Interaction",
    "ACM Transactions on Computing Education",
    "ACM Transactions on Database Systems",
    "ACM Transactions on Design Automation of Electronic Systems",
    "ACM Transactions on Embedded Computing Systems",
    "ACM Transactions on Graphics",
    "ACM Transactions on Information and System Security",
    "ACM Transactions on Information Systems",
    "ACM Transactions on Intelligent Systems and Technology",
    "ACM Transactions on Interactive Intelligent Systems",
    "ACM Transactions on Internet Technology",
    "ACM Transactions on Knowledge Discovery from Data",
    "ACM Transactions on Management Information Systems",
    "ACM Transactions on Mathematical Software",
    "ACM Transactions on Modeling and Computer Simulation",
    "ACM Transactions on Multimedia Computing, Communications, and Applications",
    "ACM Transactions on Parallel Computing",
    "ACM Transactions on Programming Languages and Systems",
    "ACM Transactions on Reconfigurable Technology and Systems",
    "ACM Transactions on Sensor Networks",
    "ACM Transactions on Software Engineering and Methodology",
    "ACM Transactions on Spatial Algorithms and Systems",
    "ACM Transactions on Speech and Language Processing",
    "ACM Transactions on Storage",
    "ACM Transactions on the Web",
    "ACME: An International Journal for Critical Geographies",
    "Acoustics Australia",
    "ACS Applied Energy Materials",
    "ACS Applied Materials & Interfaces",
    "ACS Applied Nano Materials",
    "ACS Biomaterials Science & Engineering",
    "ACS Catalysis",
    "ACS Chemical Biology",
    "ACS Chemical Neuroscience",
    "ACS Combinatorial Science",
    "ACS Earth and Space Chemistry",
    "ACS Energy Letters",
    "ACS Infectious Diseases",
    "ACS Macro Letters",
    "ACS Medicinal Chemistry Letters",
    "ACS Nano",
    "ACS Photonics",
    "ACS Sustainable Chemistry & Engineering",
    "ACS Synthetic Biology",
    "Acta Agriculturae Scandinavica, Section B - Soil & Plant Science",
    "Acta Amazonica",
    "Acta Anaesthesiologica Scandinavica",
    "Acta Anaesthesiologica Taiwanica",
    "Acta Analytica",
    "Acta Applicandae Mathematicae",
    "Acta Astronautica",
    "Acta Biologica Sibirica",
    "Acta Biomaterialia",
    "Acta Biotheoretica",
    "Acta Botanica Croatica",
    "Acta Botanica Gallica",
    "Acta Chiropterologica",
    "Acta chirurgiae orthopaedicae et traumatologiae Čechoslovaca",
    "Acta Commercii",
    "Acta Crystallographica Section A: Foundations and Advances",
    "Acta Crystallographica Section B: Structural Science, Crystal Engineering and Materials",
    "Acta Crystallographica Section C: Structural Chemistry",
    "Acta Crystallographica Section D: Biological Crystallography",
    "Acta Crystallographica Section E: Structure Reports Online",
    "Acta Crystallographica Section F: Structural Biology Communications",
    "Acta Cytologica",
    "Acta de Investigación Psicológica",
    "Acta Diabetologica",
    "Acta Ecologica Sinica",
    "acta ethologica",
    "Acta Geochimica",
    "Acta Geodaetica et Geophysica",
    "Acta Geotechnica",
    "Acta Haematologica",
    "Acta Haematologica Polonica",
    "Acta Histochemica",
    "Acta hydrotechnica",
    "Acta Ichthyologica et Piscatoria",
    "Acta Materialia",
    "Acta Mathematica Vietnamica",
    "Acta Mechanica",
    "Acta Mechanica Sinica",
    "Acta Mechanica Solida Sinica",
    "Acta Medica",
    "Acta Médica Colombiana",
    "Acta Médica Peruana",
    "Acta Medica Philippina",
    "Acta Metallurgica Sinica",
    "Acta Naturae",
    "Acta Neurobiologiae Experimentalis",
    "Acta Neurochirurgica",
    "Acta Neurologica Belgica",
    "Acta Neuropathologica",
    "Acta Neuropathologica Communications",
    "Acta Oecologica",
    "Acta Ophthalmologica",
    "Acta Ornithologica",
    "Acta Orthopaedica",
    "Acta Orthopædica Belgica",
    "Acta Orthopaedica et Traumatologica Turcica",
    "Acta Otorrinolaringológica Española (Español)",
    "Acta Paediatrica",
    "Acta Palaeontologica Polonica",
    "Acta Pharmaceutica",
    "Acta Pharmaceutica Sinica B",
    "Acta Pharmacologica Sinica",
    "Acta Philosophica",
    "Acta Physica Sinica (物理学报)",
    "Acta Physiologiae Plantarum",
    "Acta Physiologica",
    "Acta Polytechnica",
    "Acta Psychiatrica Scandinavica",
    "Acta Psychologica",
    "Acta Radiologica",
    "Acta Scientiae Veterinariae",
    "Acta Societatis Botanicorum Poloniae",
    "Acta Sociológica",
    "Acta Tropica",
    "Acta Universitatis Agriculturae et Silviculturae Mendelianae Brunensis",
    "Acta Universitatis Agriculturae Sueciae (Swedish University of Agricultural Sciences)",
    "Acta Veterinaria Scandinavica",
    "Acta Zoologica Academiae Scientiarum Hungaricae",
    "Action Learning: Research and Practice",
    "Actualités pharmaceutiques",
    "Actuators",
    "Acupuncture and Related Therapies",
    "Acupuncture in Medicine",
    "Ad Hoc Networks",
    "Adansonia",
    "Adaptive Human Behavior and Physiology",
    "Addiction Biology",
    "Addiction Science & Clinical Practice",
    "Addictive Behaviors",
    "Addictive Behaviors Reports",
    "Additive Manufacturing",
    "ADHD Attention Deficit and Hyperactivity Disorders",
    "Adipocyte",
    "Administration and Policy in Mental Health and Mental Health Services Research",
    "Administrative Science Quarterly",
    "Administrative Sciences",
    "Adolescent Research Review",
    "Adsorption",
    "Advanced Composite Materials",
    "Advanced Drug Delivery Reviews",
    "Advanced Engineering Informatics",
    "Advanced Engineering Materials",
    "Advanced Functional Materials",
    "Advanced Healthcare Materials",
    "Advanced Industrial and Engineering Polymer Research",
    "Advanced Materials",
    "Advanced Medicinal Chemistry Letters",
    "Advanced Modeling and Simulation in Engineering Sciences",
    "Advanced Optical Materials",
    "Advanced Organic Chemistry Letters",
    "Advanced Pharmaceutical Bulletin",
    "Advanced Powder Technology",
    "Advanced Robotics",
    "Advanced Structural and Chemical Imaging",
    "Advanced Theory and Simulations",
    "Advances in Accounting",
    "Advances in Alzheimer's Disease",
    "Advances in Applied Clifford Algebras",
    "Advances in Biological Regulation",
    "Advances in Biomarker Sciences and Technology",
    "Advances in Building Energy Research",
    "Advances in Climate Change Research",
    "Advances in Colloid and Interface Science",
    "Advances in Complex Systems",
    "Advances in Computational Mathematics",
    "Advances in Cosmetic Surgery",
    "Advances in Data Analysis and Classification",
    "Advances in Difference Equations",
    "Advances in Digestive Medicine",
    "Advances in Eating Disorders: Theory, Research and Practice",
    "Advances in Engineering Software",
    "Advances in Family Practice Nursing",
    "Advances in Geosciences",
    "Advances in Health Sciences Education",
    "Advances in Integrative Medicine",
    "Advances in Life Course Research",
    "Advances in Manufacturing",
    "Advances in Medical Sciences",
    "Advances in Molecular Pathology",
    "Advances in Natural Sciences: Nanoscience and Nanotechnology",
    "Advances in Nutrition",
    "Advances in Oceanography and Limnology",
    "Advances in Ophthalmology and Optometry",
    "Advances in Optics and Photonics",
    "Advances in Physiology Education",
    "Advances in Radiation Oncology",
    "Advances in Radio Science",
    "Advances in School Mental Health Promotion",
    "Advances in Science and Research",
    "Advances in Simulation",
    "Advances in Space Research",
    "Advances in Statistical Climatology, Meteorology and Oceanography",
    "Advances in Therapy",
    "Advances in Water Resources",
    "Advances in Wound Care",
    "Aeolian Research",
    "Aequationes mathematicae",
    "Aerobiologia",
    "Aerosol and Air Quality Research",
    "Aerosol Science and Technology",
    "Aerospace",
    "Aerospace Medicine and Human Performance",
    "Aerospace Science and Technology",
    "Aesthetic Plastic Surgery",
    "Aethiopica",
    "Aethiopistische Forschungen",
    "AEUE - International Journal of Electronics and Communications",
    "Africa Review",
    "African and Black Diaspora: An International Journal",
    "African Archaeological Review",
    "African Evaluation Journal",
    "African Geographical Review",
    "African Identities",
    "African Invertebrates",
    "African Journal of Career Development",
    "African Journal of Disability",
    "African Journal of Emergency Medicine",
    "African Journal of Laboratory Medicine",
    "African Journal of Marine Science",
    "African Journal of Primary Health Care and Family Medicine",
    "African Journal of Psychological Assessment",
    "African Journal of Urology",
    "African Online Scientific Information Systems - Harvard",
    "African Online Scientific Information Systems - Vancouver",
    "African Vision and Eye Health",
    "African Zoology",
    "Africa's Public Service Delivery and Performance Review",
    "Afrika Matematika",
    "Afro-Ásia (Português - Brasil)",
    "AFTE Journal",
    "AGE",
    "Age and Ageing",
    "Ageing & Society",
    "Ageing International",
    "Ageing Research Reviews",
    "Aggression and Violent Behavior",
    "Aging",
    "Aging & Mental Health",
    "Aging and Disease",
    "Aging Cell",
    "Aging Clinical and Experimental Research",
    "Aging Health",
    "Aging, Neuropsychology, and Cognition",
    "Agora",
    "Agri Gene",
    "Agriculturae Conspectus Scientificus",
    "Agricultural and Food Economics",
    "Agricultural and Forest Meteorology",
    "Agricultural Research",
    "Agricultural Systems",
    "Agricultural Water Management",
    "Agriculture",
    "Agriculture & Food Security",
    "Agriculture and Human Values",
    "Agriculture and Natural Resources",
    "Agriculture, Ecosystems and Environment",
    "Agroforestry Systems",
    "Agronomy",
    "Agronomy for Sustainable Development",
    "Agronomy Journal",
    "AI & SOCIETY",
    "AIAA Journal",
    "AIB studi (Italiano)",
    "AIDS",
    "AIDS and Behavior",
    "AIDS Care",
    "AIDS Patient Care and STDs",
    "AIDS Research and Human Retroviruses",
    "AIDS Research and Therapy",
    "AIMS Agriculture and Food",
    "AIMS Allergy and Immunology",
    "AIMS Bioengineering",
    "AIMS Biophysics",
    "AIMS Electronics and Electrical Engineering",
    "AIMS Energy",
    "AIMS Environmental Science",
    "AIMS Genetics",
    "AIMS Geosciences",
    "AIMS Materials Science",
    "AIMS Mathematics",
    "AIMS Medical Science",
    "AIMS Microbiology",
    "AIMS Molecular Science",
    "AIMS Neuroscience",
    "AIMS Press",
    "AIMS Public Health",
    "Ain Shams Engineering Journal",
    "AINS",
    "AIP Advances",
    "Air Quality, Atmosphere & Health",
    "Aix-Marseille Université - Département d'études asiatiques (Français)",
    "AKCE International Journal of Graphs and Combinatorics",
    "Aktuelle Dermatologie",
    "Aktuelle Ernährungsmedizin",
    "Aktuelle Kardiologie",
    "Aktuelle Neurologie",
    "Aktuelle Rheumatologie",
    "Aktuelle Urologie",
    "Albert-Ludwigs-Universität Freiburg - Geschichte (Deutsch)",
    "Alcohol",
    "Alcohol and Alcoholism",
    "Alcoholism and Drug Addiction",
    "Alcoholism: Clinical and Experimental Research",
    "Alergologia Polska- Polish Journal of Allergology",
    "Alexandria Engineering Journal",
    "Alexandria Journal of Medicine",
    "Algal Research",
    "Algebra universalis",
    "Algebras and Representation Theory",
    "Algorithmica",
    "Algorithms",
    "Algorithms for Molecular Biology",
    "Al-Jami'ah - Journal of Islamic Studies",
    "Alkoholizmus a drogové závislosti",
    "Allergology International",
    "Allergy",
    "Allergy, Asthma & Clinical Immunology",
    "Allgemein- und Viszeralchirurgie up2date",
    "Alpine Botany",
    "Alpine Entomology",
    "Alter - European Journal of Disability research, Revue européenne de recherche sur le handicap",
    "Alternatif Politika",
    "Alternatives to Animal Experimentation",
    "Alzheimer's & Dementia: Diagnosis, Assessment & Disease Monitoring",
    "Alzheimer's & Dementia: The Journal of the Alzheimer's Association",
    "Alzheimer's & Dementia: Translational Research & Clinical Interventions",
    "Alzheimer's Research & Therapy",
    "AMAR Analytic Methods in Accident Research.",
    "AMB Express",
    "AMBIO",
    "Ameghiniana",
    "American Anthropological Association",
    "American Antiquity",
    "American Association for Cancer Research",
    "American Association of Petroleum Geologists",
    "American Educational Research Journal",
    "American Entomologist",
    "American Family Physician",
    "American Fisheries Society",
    "American Geophysical Union",
    "American Heart Association",
    "American Heart Journal",
    "American Institute of Aeronautics and Astronautics",
    "American Institute of Physics",
    "American Journal of Agricultural Economics",
    "American Journal of Alzheimer's Disease & Other Dementias",
    "American Journal of Archaeology",
    "American Journal of Botany",
    "American Journal of Cardiovascular Drugs",
    "American Journal of Climate Change",
    "American Journal of Clinical Dermatology",
    "American Journal of Clinical Pathology",
    "American Journal of Community Psychology",
    "American Journal of Criminal Justice",
    "American Journal of Dance Therapy",
    "American Journal of Enology and Viticulture",
    "American Journal of Epidemiology",
    "American Journal of Gastroenterology Supplements",
    "American Journal of Health Behavior",
    "American Journal of Health-System Pharmacy",
    "American Journal of Hypertension",
    "American Journal of Industrial Medicine",
    "American Journal of Infection Control",
    "American Journal of Kidney Diseases",
    "American Journal of Medical Genetics",
    "American Journal of Nephrology",
    "American Journal of Neuroradiology",
    "American Journal of Obstetrics & Gynecology",
    "American Journal of Ophthalmology",
    "American Journal of Ophthalmology Case Reports",
    "American Journal of Orthodontics & Dentofacial Orthopedics",
    "American Journal of Orthopsychiatry",
    "American Journal of Otolaryngology--Head and Neck Medicine and Surgery",
    "American Journal of Physical Anthropology",
    "American Journal of Physiology - Cell Physiology",
    "American Journal of Physiology - Endocrinology and Metabolism",
    "American Journal of Physiology - Gastrointestinal and Liver Physiology",
    "American Journal of Physiology - Heart and Circulatory Physiology",
    "American Journal of Physiology - Lung Cellular and Molecular Physiology",
    "American Journal of Physiology - Regulatory, Integrative, and Comparative Physiology",
    "American Journal of Physiology - Renal Physiology",
    "American Journal of Plant Sciences",
    "American Journal of Political Science",
    "American Journal of Potato Research",
    "American Journal of Primatology",
    "American Journal of Public Health",
    "American Journal of Reproductive Immunology",
    "American Journal of Respiratory and Critical Care Medicine",
    "American Journal of Roentgenology",
    "American Journal of Science",
    "American Journal of Sociology",
    "American Journal of Sonography",
    "American Journal of Surgical Pathology",
    "American Journal of Translational Research",
    "American Journal of Veterinary Research",
    "American Marketing Association",
    "American Medical Association 10th edition",
    "American Medical Association 11th edition",
    "American Medical Association 11th edition (brackets)",
    'American Medical Association 11th edition (no "et al.")',
    "American Medical Association 11th edition (no URL)",
    "American Medical Association 11th edition (no URL, sorted alphabetically)",
    "American Medical Association 11th edition (parentheses)",
    "American Medical Association 11th edition (sorted alphabetically)",
    "American Medical Writers Association Journal",
    "American Meteorological Society",
    "American Mineralogist",
    "American Nuclear Society",
    "American Physical Society",
    "American Physical Society - et al. (if more than 3 authors)",
    "American Physical Society (without titles)",
    "American Physiological Society",
    "American Phytopathological Society",
    "American Political Science Association",
    "American Political Science Review",
    "American Psychological Association 5th edition",
    "American Psychological Association 6th edition",
    'American Psychological Association 6th edition ("doi:" DOI prefix)',
    "American Psychological Association 6th edition (no ampersand)",
    "American Psychological Association 6th edition (no DOIs, no issue numbers)",
    "American Psychological Association 6th edition (Provost) (Français - Canada)",
    "American Psychological Association 6th edition (Türkçe)",
    "American Psychological Association 7th edition",
    "American Psychological Association 7th edition (annotated bibliography)",
    "American Psychological Association 7th edition (curriculum vitae, sorted by descending date)",
    "American Psychological Association 7th edition (no ampersand)",
    "American Psychological Association 7th edition (no initials)",
    "American Psychological Association 7th edition (numeric, brackets)",
    "American Psychological Association 7th edition (numeric, superscript)",
    "American Psychological Association 7th edition (single-spaced bibliography)",
    "American Psychological Association 7th edition (with abstract)",
    "American Psychologist",
    "American Review of Canadian Studies",
    "American School of Classical Studies at Athens",
  ];

  const getMonthName = (monthIndex) => {
    return monthNames[monthIndex];
  };

  const setCurrentDateValue = () => {
    const today = new Date();
    const formattedDate = `${today.getDate()} ${getMonthName(
      today.getMonth()
    )} ${today.getFullYear()}`;
    setCurrentDate(formattedDate);
  };

  useEffect(() => {
    setCurrentDateValue();
  }, []);

  const citationStyleRef = useRef();

  const handleCiteButtonClick = async () => {
    setLoading(true);
    const selectedStyle = citationStyleRef.current.value;
    if (typeof chrome !== "undefined" && chrome.storage) {
      // Your chrome.storage related code here
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const citeUrl = tabs[0].url;

        try {
          const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Keeping in mind today's date as ${currentDate}. 
                Write me a ${selectedStyle} style citation for ${citeUrl}. 
                Your answer should strictly follow a JSON format having the fields :- 
                title, url, description, author, accessed_date(already provided), credibility(high/low/medium), citation, citation_format. 
                the citation format is the style said previously`,
              },
            ],
          });

          const result = completion.data.choices[0].message.content.trim();
          setCiteRes(result);
          const parsedResult = JSON.parse(result);
          console.log("Res from api : \n", parsedResult);
          setCitationData(parsedResult);
          const index = citations.length + 1;
          saveCitation(index, parsedResult);
          setLoading(false);
        } catch (error) {
          console.error(error);
          setCitationResult("Error: Failed to get a response");
        }
      });
    } else {
      console.warn("Chrome storage API not available.");
    }

    // Get the current tab's URL
  };

  const fetchCitations = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get(null, (items) => {
        const fetchedCitations = Object.entries(items)
          .filter(([key]) => key.startsWith(STORAGE_CITATION_PREFIX))
          .filter(
            ([_, value]) =>
              !searchQuery ||
              value.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              value.citation.toLowerCase().includes(searchQuery.toLowerCase())
          );
        setCitations(fetchedCitations);
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  useEffect(() => {
    fetchCitations();
  }, []);

  useEffect(() => {
    fetchExpansions();
  }, []);

  useEffect(() => {
    filterExpansions();
  }, [query, expansions]);

  const fetchExpansions = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get(null, (items) => {
        const exps = Object.entries(items).filter(([key]) =>
          key.startsWith(STORAGE_TEXT_PREFIX)
        );
        setExpansions(exps);
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const filterExpansions = () => {
    const filtered = expansions.filter(([key, value]) => {
      const formattedKey = key.replace(STORAGE_TEXT_PREFIX, "");
      return (
        formattedKey.toLowerCase().includes(query.toLowerCase()) ||
        value.toLowerCase().includes(query.toLowerCase())
      );
    });
    setFilteredExpansions(filtered);
  };

  const addExpansion = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      if (newShortcut && newExpansion) {
        const formattedShortcut = newShortcut.startsWith(":")
          ? newShortcut
          : `:${newShortcut}`;

        if (editingKey) {
          window.chrome.storage.local.remove(editingKey, () => {
            window.chrome.storage.local.set(
              { [STORAGE_TEXT_PREFIX + formattedShortcut]: newExpansion },
              () => {
                setNewShortcut("");
                setNewExpansion("");
                setEditingKey(null);
                fetchExpansions();
              }
            );
          });
        } else {
          window.chrome.storage.local.set(
            { [STORAGE_TEXT_PREFIX + formattedShortcut]: newExpansion },
            () => {
              setNewShortcut("");
              setNewExpansion("");
              fetchExpansions();
            }
          );
        }
      }
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const deleteExpansion = (key) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.remove(key, () => {
        fetchExpansions();
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const editExpansion = (key) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      setNewShortcut(key.replace(STORAGE_TEXT_PREFIX, ""));
      setNewExpansion(expansions.find(([k]) => k === key)[1]);
      setEditingKey(key);
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const handleLinkBtnClick = () => {
    setDisplayDiv("saveLinks");
  };

  const handleTextBtnClick = () => {
    setDisplayDiv("saveText");
  };

  const handleFormBtnClick = () => {
    setDisplayDiv("saveForms");
  };
  const handleCitationBtnClick = () => {
    setDisplayDiv("saveCitations");
  };
  const saveShortcut = (event) => {
    event.preventDefault();
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      if (text && url) {
        window.chrome.storage.local.set(
          { [STORAGE_LINKS_PREFIX + text]: url },
          () => {
            setText("");
            setUrl("");
            fetchShortcuts();
          }
        );
      }
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const editShortcut = (shortcut) => {
    setText(shortcut.text);
    setUrl(shortcut.url);
  };

  const deleteShortcut = (shortcut) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.remove(
        STORAGE_LINKS_PREFIX + shortcut.text,
        fetchShortcuts
      );
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const fetchShortcuts = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get(null, (items) => {
        const savedShortcuts = Object.entries(items)
          .filter(([key]) => key.startsWith(STORAGE_LINKS_PREFIX))
          .map(([key, value]) => ({
            text: key.replace(STORAGE_LINKS_PREFIX, ""),
            url: value,
          }));
        setShortcuts(savedShortcuts);
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const fetchForms = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.get(null, (items) => {
        const fetchedForms = Object.entries(items).filter(([key]) =>
          key.startsWith(STORAGE_FORM_PREFIX)
        );
        setForms(fetchedForms);
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const addForm = () => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      if (newFormTitle && newFormData) {
        const formattedFormTitle = newFormTitle.startsWith(":")
          ? newFormTitle
          : `:${newFormTitle}`;

        if (editingFormKey) {
          window.chrome.storage.local.remove(editingFormKey, () => {
            window.chrome.storage.local.set(
              { [STORAGE_FORM_PREFIX + formattedFormTitle]: newFormData },
              () => {
                setNewFormTitle("");
                setNewFormData("");
                setEditingFormKey(null);
                fetchForms();
              }
            );
          });
        } else {
          window.chrome.storage.local.set(
            { [STORAGE_FORM_PREFIX + formattedFormTitle]: newFormData },
            () => {
              setNewFormTitle("");
              setNewFormData("");
              fetchForms();
            }
          );
        }
      }
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const deleteForm = (key) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      window.chrome.storage.local.remove(key, () => {
        fetchForms();
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const editForm = (key) => {
    if (window.chrome && window.chrome.storage && window.chrome.storage.local) {
      setNewFormTitle(key.replace(STORAGE_FORM_PREFIX, ""));
      setNewFormData(forms.find(([k]) => k === key)[1]);
      setEditingFormKey(key);
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const filterForms = () => {
    const filtered = forms.filter(([key, value]) => {
      const formattedKey = key.replace(STORAGE_FORM_PREFIX, "");
      return (
        formattedKey.toLowerCase().includes(formQuery.toLowerCase()) ||
        value.toLowerCase().includes(formQuery.toLowerCase())
      );
    });
    setFilteredForms(filtered);
  };

  useEffect(() => {
    filterForms();
  }, [formQuery, forms]);

  useEffect(() => {
    fetchShortcuts();
  }, []);

  return (
    <div className="saveForms">
      <label htmlFor="">Save Your Forms</label>
      <input
        type="text"
        placeholder="Search forms..."
        value={formQuery}
        onChange={(e) => setFormQuery(e.target.value)}
      />
      <input
        type="text"
        placeholder="Form Title"
        value={newFormTitle}
        onChange={(e) => setNewFormTitle(e.target.value)}
      />
      <textarea
        placeholder="Form Data"
        value={newFormData}
        onChange={(e) => setNewFormData(e.target.value)}
        rows={7}
        style={{
          background: "#f7f1f1",
          border: "none",
          width: "100%",
          fontSize: "17px",
          padding: "12px",
        }}
      />
      <button type="button" onClick={addForm} style={{ marginLeft: "0px" }}>
        {editingFormKey ? "Update" : "Add"}
      </button>
      <ul>
        {filteredForms.map(([key, value]) => (
          <li key={key} style={{ flexDirection: "column" }}>
            <div
              className="labelWrapper"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span
                className="label formTitle"
                style={{ fontSize: "27px", fontWeight: "900" }}
              >
                {key.replace(STORAGE_FORM_PREFIX, "")}
              </span>
              <span className="label formData">{value}</span>
            </div>
            <div className="actions">
              <button
                type="button"
                aria-label="Edit"
                title="Edit"
                className="btn-picto"
                onClick={() => editForm(key)}
              >
                <AiOutlineEdit className="edit-btn" size={32} />
              </button>
              <button
                type="button"
                aria-label="Delete"
                title="Delete"
                className="btn-picto"
                onClick={() => deleteForm(key)}
              >
                <AiOutlineDelete className="delete-btn" size={32} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Forms;
