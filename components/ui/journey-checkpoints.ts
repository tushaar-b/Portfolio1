export interface JourneyCheckpoint {
  id:string;
  label:string;
  title:string;
  period?:string;
  description?:string;
  highlights?:{label:string;value:string}[];
  short?:string;
  icon:'school'|'cap'|'laptop'|'trophy'|'medal';
}

// Add/remove an object here; the scene and scroll schedule derive from this array.
export const checkpoints:JourneyCheckpoint[] = [
  { id:'schooling', label:'Schooling', title:'Brain International School', period:'', description:'', icon:'school', highlights:[{label:'Class X',value:'94%'},{label:'Class XII',value:'96%'}] },
  { id:'higher-ed', label:'Higher Education', title:'B.Tech CSE (Data Science)', period:'', description:'', icon:'cap', highlights:[{label:'CGPA',value:'9.4'}] },
  { id:'experience', label:'Experience', title:'Web Development Intern', period:'', description:'', icon:'laptop' },
  { id:'sih', label:'Hackathon', title:'SIH Internal Hackathon', highlights:[{label:'Result',value:'Finalist'}], icon:'trophy', short:'SIH' },
  { id:'vinhack', label:'Hackathon', title:'Vinhack', highlights:[{label:'Result',value:'2nd Runner Up'}], icon:'medal', short:'Vinhack' },
];
