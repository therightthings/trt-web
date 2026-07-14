export enum FileSizeUnit {
  Byte = 'byte',
  Kb = 'kb',
  Mb = 'Mb',
  Gb = 'Gb',
  Tb = 'Tb',
  Pb = 'Pb',
  Eb = 'Eb',
}

export const FILE_SIZE_UNIT_FACTORS: Record<FileSizeUnit, number> = {
  [FileSizeUnit.Byte]: 1,
  [FileSizeUnit.Kb]: 1024,
  [FileSizeUnit.Mb]: 1024 ** 2,
  [FileSizeUnit.Gb]: 1024 ** 3,
  [FileSizeUnit.Tb]: 1024 ** 4,
  [FileSizeUnit.Pb]: 1024 ** 5,
  [FileSizeUnit.Eb]: 1024 ** 6,
};
