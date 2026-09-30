import type { ComponentType } from 'react';
import { ResponsivePseudoScatterPlot } from './week-01/ResponsivePseudoScatterPlot';
import { CyberattacksSummary } from './week-02/CyberattacksSummary';
import { FirstVis } from './week-03/FirstVis';
import { ImprovedVis } from './week-04/ImprovedVis'
import { Tooltips } from './week-05/Tooltips';
import { ProjV1 } from './week-06/ProjV1';

export interface Assignment {
  id: string;
  name: string;
  component: ComponentType;
}

export const assignments: Assignment[] = [
  {
    id: '1',
    name: 'Week 1',
    component: ResponsivePseudoScatterPlot,
  },
  {
    id: '2',
    name: 'Week 2',
    component: CyberattacksSummary,
  },
  {
    id: '3',
    name: 'Week 3',
    component: FirstVis,
  },
  {
    id: '4',
    name: 'Week 4',
    component: ImprovedVis,
  },
  {
    id: '5',
    name: 'Week 5',
    component: Tooltips,
  },
  {
    id: '6',
    name: 'Week 6',
    component: ProjV1,
  }
];

export const assignmentsMap = new Map(assignments.map((ex) => [ex.id, ex]));

export const defaultAssignment = '1';
