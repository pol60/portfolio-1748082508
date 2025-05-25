import {
  forwardRef,
  Ref,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import * as echarts from 'echarts';

/**
 * Props for SkillChart. Extend if you need additional inputs.
 */
export interface SkillChartProps {}

/**
 * SkillChart renders a radar chart of skills using ECharts
 * Supports forwarded ref to the chart container div
 */
const SkillChart = forwardRef<HTMLDivElement, SkillChartProps>((props, ref: Ref<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose the container div to parent via ref
  useImperativeHandle(ref, () => containerRef.current!);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current);

    const option = {
      animation: false,
      radar: {
        indicator: [
          { name: 'React', max: 100 },
          { name: 'TypeScript', max: 100 },
          { name: 'Node.js', max: 100 },
          { name: 'Next.js', max: 100 },
          { name: 'MongoDB', max: 100 },
          { name: 'PostgreSQL', max: 100 },
        ],
        radius: '65%',
        splitNumber: 4,
        axisName: {
          color: '#6366f1',
          fontSize: 12,
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(99, 102, 241, 0.05)', 'rgba(99, 102, 241, 0.1)'],
          },
        },
      },
      series: [
        {
          name: 'Навыки',
          type: 'radar',
          data: [
            {
              value: [95, 90, 85, 90, 80, 85],
              name: 'Уровень владения',
              areaStyle: {
                color: 'rgba(99, 102, 241, 0.4)',
              },
              lineStyle: {
                color: '#6366f1',
              },
              itemStyle: {
                color: '#6366f1',
              },
            },
          ],
        },
      ],
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-80" />;
});

SkillChart.displayName = 'SkillChart';

export default SkillChart;
