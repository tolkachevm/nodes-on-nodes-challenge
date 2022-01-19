import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import axios from 'axios';

type Node = {
  id: string;
  child_node_ids: string[];
}
type NodesResponse = { data: Node[] };
type Counters = Record<string, number>;

const API_ENDPOINT = 'https://nodes-on-nodes-challenge.herokuapp.com/nodes/';
const INITIAL_ID = '089ef556-dfff-4ff2-9733-654645be56fe';
const getMaxOfArray = (values: number[]): number => Math.max.apply(null, values);
const mostSharedIds = (idCounters: Counters) => {
  const mostSharedCount = getMaxOfArray(Object.values(idCounters));
  return Object.entries(idCounters)
    .filter(([_, value]) => value === mostSharedCount)
    .map(([key]) => key);

}

const App = () => {
  const [started, setStarted] = React.useState<boolean>(false);
  const [uniqueIdsValue, setUniqueIdsValue] = React.useState<number>(1);
  const [mostSharedIdsValue, setMostSharedIdsValue] = React.useState<string[]>([INITIAL_ID]);

  const fetchNodes1 = React.useCallback(() => {
    setStarted(true);
    const uniqueIds: string[] = [];
    const idCounters: Counters = { [INITIAL_ID]: 1 };
    const fetchNodes = (ids: string[]) => {
      if (!ids.length) return;
      axios.get(`${API_ENDPOINT}${ids.join()}`)
        .then(({ data }: NodesResponse) => {
          if (!data.length) return;
          const localIds: string[] = []
          data.forEach(node => {
            if (!node.child_node_ids.length) return;
            node.child_node_ids.forEach(id => {
              if (uniqueIds.indexOf(id) === -1) {
                uniqueIds.push(id);
                localIds.push(id);
                idCounters[id] = 0;
              } else
                idCounters[id] = idCounters[id] + 1;
            })
          });
          setUniqueIdsValue(uniqueIds.length);
          setMostSharedIdsValue(mostSharedIds(idCounters));
          fetchNodes(localIds);
        });
    }
    fetchNodes([INITIAL_ID]);
  }, []);

  return (
    <>
      <h4>Nodes-on-nodes-challenge</h4>
      <button onClick={fetchNodes1}>FETCH</button><br />
      {started && (
        <>
          unique ids count: {uniqueIdsValue}<br />
          most shared: {mostSharedIdsValue.join(', ')}
        </>
      )}
    </>
  )
}

export default hot(App);
