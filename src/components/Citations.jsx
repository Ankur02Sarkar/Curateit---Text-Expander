/* global chrome */
import React, { useEffect, useRef, useReducer } from "react";
import { Configuration, OpenAIApi } from "openai";

const STORAGE_CITATION_PREFIX = "curateit_citation_";

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CITATIONS":
      return { ...state, citations: action.payload };
    case "SET_CITATION_RESULT":
      return { ...state, citationResult: action.payload };
    case "SET_COPY_STATE":
      return { ...state, isCopied: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    default:
      return state;
  }
};

const chromeStorageAvailable = () =>
  typeof chrome !== "undefined" && chrome.storage;

const Citations = () => {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    citations: [],
    citationResult: "",
    isCopied: false,
    searchTerm: "",
  });

  const citationStyleRef = useRef();

  const saveCitation = (key, data) => {
    if (chromeStorageAvailable()) {
      chrome.storage.local.set(
        { [`${STORAGE_CITATION_PREFIX}${key}`]: data },
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
    const citationContent = event.target.parentElement.previousSibling;
    range.selectNode(citationContent);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    dispatch({ type: "SET_COPY_STATE", payload: true });
  };

  const resetCopyState = () => {
    dispatch({ type: "SET_COPY_STATE", payload: false });
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
    return formattedDate;
  };

  useEffect(() => {
    setCurrentDateValue();
  }, []);

  const handleCiteButtonClick = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    const selectedStyle = citationStyleRef.current.value;
    if (chromeStorageAvailable()) {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const citeUrl = tabs[0].url;
        const currentDate = setCurrentDateValue();

        try {
          const completion = await openai.createChatCompletion({
            model: "gpt-4",
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
          const parsedResult = JSON.parse(result);
          console.log("Res from api : \n", parsedResult);
          const key = new Date().getTime();
          saveCitation(key, parsedResult);
          dispatch({ type: "SET_LOADING", payload: false });
        } catch (error) {
          console.error(error);
          dispatch({
            type: "SET_CITATION_RESULT",
            payload: "Error: Failed to get a response",
          });
        }
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  const fetchCitations = () => {
    if (chromeStorageAvailable()) {
      chrome.storage.local.get(null, (items) => {
        const fetchedCitations = Object.entries(items).filter(([key]) =>
          key.startsWith(STORAGE_CITATION_PREFIX)
        );
        dispatch({ type: "SET_CITATIONS", payload: fetchedCitations });
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  useEffect(() => {
    fetchCitations();
  }, [state.searchTerm]);

  const removeCitation = (key) => {
    if (chromeStorageAvailable()) {
      chrome.storage.local.remove(key, () => {
        console.log("Citation removed.");
        fetchCitations();
      });
    } else {
      console.warn("Chrome storage API not available.");
    }
  };

  return (
    <div className="saveCitations">
      <label htmlFor="">Cite an URL</label>
      <div>
        <select ref={citationStyleRef}>
          {citationStyles.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleCiteButtonClick}
          style={{ marginLeft: "0px" }}
        >
          Cite
        </button>
      </div>

      <input
        type="text"
        placeholder="Search citations..."
        value={state.searchTerm}
        onChange={(event) =>
          dispatch({ type: "SET_SEARCH_TERM", payload: event.target.value })
        }
      />

      <ul className="listWrapper">
        {state.loading && <h3>Gathering Data...</h3>}

        {state.citations
          .filter(([key, citation]) => {
            return citation.title
              .toLowerCase()
              .includes(state.searchTerm.toLowerCase());
          })
          .map(([key, citation], index) => (
            <li
              className="listItem"
              style={{ flexDirection: "column" }}
              key={index}
              onMouseLeave={resetCopyState}
            >
              <div className="citationContent">
                <div className="labelWrapper">
                  <div className="entry">
                    <span className="entryTitle">{`Title : `}</span>
                    <span className="entryContent">{`${citation.title}`}</span>
                  </div>
                  <div className="entry">
                    <span className="entryTitle">{`URL : `}</span>
                    <span className="entryContent">{`${citation.url}`}</span>
                  </div>
                  <div className="entry">
                    <span className="entryTitle">{`Description : `}</span>
                    <span className="entryContent">{`${citation.description}`}</span>
                  </div>
                  <div className="entry">
                    <span className="entryTitle">{`Author : `}</span>
                    <span className="entryContent">{`${citation.author}`}</span>
                  </div>
                  <div className="entry">
                    <span className="entryTitle">{`Accessed Date : `}</span>
                    <span className="entryContent">{`${citation.accessed_date}`}</span>
                  </div>
                  <div className="entry">
                    <span className="entryTitle">{`Credibility : `}</span>
                    <span className="entryContent">{`${citation.credibility}`}</span>
                  </div>
                  <div className="entry">
                    <span className="entryTitle">{`Citation : `}</span>
                    <span className="entryContent">{`${citation.citation}`}</span>
                  </div>
                  <div className="entry">
                    <span className="entryTitle">{`Citation Format : `}</span>
                    <span className="entryContent">{`${citation.citation_format}`}</span>
                  </div>
                </div>
              </div>

              <div className="buttonWrapper">
                <button
                  className="copyButton"
                  onClick={copyToClipboard}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {state.isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  className="removeButton"
                  onClick={() => removeCitation(key)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Citations;
