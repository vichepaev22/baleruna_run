export interface CharacterData {
  id: string;
  name: string;
  description: string;
  abilityName: string;
  abilityDescription: string;
  speed: number;
  jump: number;
  defense: number;
  collect: number;
  abilityCost: number;
  passiveBonus?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    skin: string;
  };
}

export const characters: CharacterData[] = [
  {
    id: 'cappuccina',
    name: 'Балерина Капучина',
    description: 'Изящная балерина с головой-чашкой капучино. Грациозна в воздухе.',
    abilityName: 'Волшебное пируэтто',
    abilityDescription: 'Дополнительный воздушный прыжок с вращением и защитой',
    speed: 3,
    jump: 5,
    defense: 2,
    collect: 3,
    abilityCost: 40,
    colors: { primary: '#FF65A3', secondary: '#FFF4E8', accent: '#9B5C3C', skin: '#FFEEDD' }
  },
  {
    id: 'espresso',
    name: 'Эспрессо Ниндзя',
    description: 'Маленький энергичный герой в тёмной маске. Молниеносный рывок.',
    abilityName: 'Кофейный рывок',
    abilityDescription: 'Резкое ускорение и проход сквозь препятствия',
    speed: 5,
    jump: 3,
    defense: 2,
    collect: 2,
    abilityCost: 40,
    colors: { primary: '#3D2B1F', secondary: '#FFC44C', accent: '#7757E8', skin: '#8B6914' }
  },
  {
    id: 'turboroll',
    name: 'Рулончик Турбо',
    description: 'Забавный робот-рулон. Прочный и собирает всё вокруг.',
    abilityName: 'Бумажный щит',
    abilityDescription: 'Силовое поле, выдерживающее одно столкновение',
    speed: 2,
    jump: 2,
    defense: 5,
    collect: 5,
    abilityCost: 45,
    passiveBonus: 'Увеличенный радиус сбора',
    colors: { primary: '#FFFFFF', secondary: '#49C7F5', accent: '#FFC44C', skin: '#E8E8E8' }
  },
  {
    id: 'lattelisa',
    name: 'Латте Лиса',
    description: 'Рыжая лисица в кофейном костюме. Притягивает рулоны к себе.',
    abilityName: 'Кофейный магнит',
    abilityDescription: 'Притягивает рулоны с увеличенного расстояния на 5 сек',
    speed: 4,
    jump: 4,
    defense: 2,
    collect: 4,
    abilityCost: 45,
    passiveBonus: 'Повышенный сбор энергии',
    colors: { primary: '#FF8C42', secondary: '#49C7F5', accent: '#FF65A3', skin: '#FFB366' }
  }
];
