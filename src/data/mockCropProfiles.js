// seed data based on the provided requirements

export const defaultProfile = {
  id: 'profile-standard',
  name: 'Receta Standard Alta Producción',
  description: 'Perfil de cultivo para maximizar rendimiento y calidad.',
  floraTotalWeeks: 10,
  phases: [
    {
      id: 'phase-1',
      stage: 'clone',
      name: 'Clones / Esquejes',
      startWeek: null,
      endWeek: null,
      irrigationStrategy: '',
      vpdTarget: 0.8, vpdMin: 0.7, vpdMax: 0.9,
      ppfdTarget: 175, ppfdMin: 150, ppfdMax: 200,
      tempTarget: 26.0, tempMin: 25.5, tempMax: 26.5,
      humidityTarget: 72.5, humidityMin: 70.0, humidityMax: 75.0,
      drybackTarget: null, drybackMin: null, drybackMax: null,
      ecInputTarget: null, ecInputMin: null, ecInputMax: null,
      ecOutputTarget: null, ecOutputMin: null, ecOutputMax: null,
      phInputTarget: null, phInputMin: null, phInputMax: null,
      phOutputTarget: null, phOutputMin: null, phOutputMax: null
    },
    {
      id: 'phase-2',
      stage: 'vege',
      name: 'Vegetativo (Sala Definitiva)',
      startWeek: null,
      endWeek: null,
      irrigationStrategy: 'Vegetativa',
      vpdTarget: 1.0, vpdMin: 0.9, vpdMax: 1.1,
      ppfdTarget: 475, ppfdMin: 450, ppfdMax: 500,
      tempTarget: 26.0, tempMin: 25.0, tempMax: 27.0,
      humidityTarget: 65.0, humidityMin: 60.0, humidityMax: 70.0,
      drybackTarget: 35.0, drybackMin: 30.0, drybackMax: 40.0,
      ecInputTarget: 2.5, ecInputMin: 2.0, ecInputMax: 3.0,
      ecOutputTarget: 3.0, ecOutputMin: 2.5, ecOutputMax: 4.0,
      phInputTarget: 6.0, phInputMin: 5.8, phInputMax: 6.2,
      phOutputTarget: 6.0, phOutputMin: 5.5, phOutputMax: 6.5
    },
    {
      id: 'phase-3',
      stage: 'flora',
      name: 'Stretch (Semanas 1 a 3)',
      startWeek: 1,
      endWeek: 3,
      irrigationStrategy: 'Generativa',
      vpdTarget: 1.2, vpdMin: 1.1, vpdMax: 1.3,
      ppfdTarget: 650, ppfdMin: 600, ppfdMax: 700,
      tempTarget: 23.5, tempMin: 23.0, tempMax: 24.0,
      humidityTarget: 55.0, humidityMin: 50.0, humidityMax: 60.0,
      drybackTarget: 45.0, drybackMin: 40.0, drybackMax: 50.0,
      ecInputTarget: 2.8, ecInputMin: 2.5, ecInputMax: 3.2,
      ecOutputTarget: 7.5, ecOutputMin: 5.0, ecOutputMax: 10.0,
      phInputTarget: 5.8, phInputMin: 5.6, phInputMax: 6.0,
      phOutputTarget: 5.8, phOutputMin: 5.5, phOutputMax: 6.2
    },
    {
      id: 'phase-4',
      stage: 'flora',
      name: 'Engorde / Bulking (Semanas 4 a 8)',
      startWeek: 4,
      endWeek: 8,
      irrigationStrategy: 'Vegetativa',
      vpdTarget: 1.3, vpdMin: 1.2, vpdMax: 1.4,
      ppfdTarget: 850, ppfdMin: 800, ppfdMax: 900,
      tempTarget: 25.5, tempMin: 25.0, tempMax: 26.0,
      humidityTarget: 57.5, humidityMin: 55.0, humidityMax: 60.0,
      drybackTarget: 35.0, drybackMin: 30.0, drybackMax: 40.0,
      ecInputTarget: 2.8, ecInputMin: 2.5, ecInputMax: 3.5,
      ecOutputTarget: 4.0, ecOutputMin: 3.0, ecOutputMax: 5.0,
      phInputTarget: 6.0, phInputMin: 5.8, phInputMax: 6.2,
      phOutputTarget: 6.0, phOutputMin: 5.5, phOutputMax: 6.5
    },
    {
      id: 'phase-5',
      stage: 'flora',
      name: 'Maduración (Últimas semanas)',
      startWeek: 9,
      endWeek: 10,
      irrigationStrategy: 'Generativa',
      vpdTarget: 1.4, vpdMin: 1.3, vpdMax: 1.5,
      ppfdTarget: 800, ppfdMin: 700, ppfdMax: 850,
      tempTarget: 22.5, tempMin: 22.0, tempMax: 23.0,
      humidityTarget: 50.0, humidityMin: 45.0, humidityMax: 55.0,
      drybackTarget: 45.0, drybackMin: 40.0, drybackMax: 50.0,
      ecInputTarget: 1.5, ecInputMin: 1.0, ecInputMax: 2.0,
      ecOutputTarget: 2.0, ecOutputMin: 1.0, ecOutputMax: 3.0,
      phInputTarget: 6.2, phInputMin: 6.0, phInputMax: 6.5,
      phOutputTarget: 6.0, phOutputMin: 5.5, phOutputMax: 6.5
    }
  ]
};

export const getInitialProfiles = () => {
  const saved = localStorage.getItem('cropProfiles');
  if (saved) {
    return JSON.parse(saved);
  }
  return [defaultProfile];
};
