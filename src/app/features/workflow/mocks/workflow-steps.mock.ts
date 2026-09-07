export const WORKFLOWSTEPS = [
  {
    id: '1',
    step: 0,
    institutionCode: 'PE-MEF',
    assignedUsers: [
      { userName: 'Cchavez', email: 'cchavez@email.com'},
      { userName: 'Emoreno', email: 'emoreno@email.com'},
      { userName: 'Rmamani', email: 'rmamani@email.com'},
      { userName: 'Cquispe', email: 'cquispe@email.com'}
    ],
    taskDescription: 'Ingresar y enviar',
    lastUpdate: new Date(2021, 0, 1)
  },
  {
    id: '3',
    step: 4,
    institutionCode: 'PE-BCRP',
    assignedUsers: [
      { userName: 'Cquispe', email: 'cquispe@email.com'}  
    ],
    taskDescription: 'Firma autorizada',
    lastUpdate: new Date(2021, 2, 1)
  },
];
