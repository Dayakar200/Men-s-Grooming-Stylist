import { Hairstyle, BeardStyle, StylePreset } from './types';

export const HAIRSTYLE_OPTIONS: Hairstyle[] = [
  Hairstyle.None,
  Hairstyle.BuzzCut,
  Hairstyle.CrewCut,
  Hairstyle.Fade,
  Hairstyle.Pompadour,
  Hairstyle.Quiff,
  Hairstyle.SlickBack,
  Hairstyle.ManBun,
];

export const BEARD_STYLE_OPTIONS: BeardStyle[] = [
  BeardStyle.None,
  BeardStyle.CleanShaven,
  BeardStyle.Goatee,
  BeardStyle.VanDyke,
  BeardStyle.FullBeard,
  BeardStyle.Stubble,
  BeardStyle.MuttonChops,
];

export const STYLE_PRESETS: StylePreset[] = [
  { 
    name: 'Select a Preset...', 
    options: { 
      hairstyle: Hairstyle.None, 
      beardStyle: BeardStyle.None, 
      colorPrompt: '',
      textPrompt: '',
      referenceImage: null,
    } 
  },
  { 
    name: 'The Classic Fade', 
    options: { 
      hairstyle: Hairstyle.Fade, 
      beardStyle: BeardStyle.CleanShaven, 
      colorPrompt: '',
      textPrompt: 'A sharp, classic fade haircut. Clean shaven look.',
      referenceImage: null,
    } 
  },
  { 
    name: 'Rugged Gentleman', 
    options: { 
      hairstyle: Hairstyle.Quiff, 
      beardStyle: BeardStyle.FullBeard, 
      colorPrompt: '',
      textPrompt: 'A stylish quiff with a well-groomed full beard.',
      referenceImage: null,
    } 
  },
  { 
    name: 'Platinum Buzz', 
    options: { 
      hairstyle: Hairstyle.BuzzCut, 
      beardStyle: BeardStyle.Stubble, 
      colorPrompt: 'platinum blonde',
      textPrompt: 'A bold platinum blonde buzz cut with light stubble.',
      referenceImage: null,
    }
  },
  {
    name: 'Modern Pompadour',
    options: {
      hairstyle: Hairstyle.Pompadour,
      beardStyle: BeardStyle.Stubble,
      colorPrompt: 'dark brown',
      textPrompt: 'A modern pompadour with a tight fade on the sides and designer stubble.',
      referenceImage: null,
    }
  }
];