export type FileSizeUnit = 'byte' | 'kb' | 'Mb' | 'Gb' | 'Tb' | 'Pb' | 'Eb';

export interface FileSizeConfig {
  value: number;
  unit: FileSizeUnit;
}
