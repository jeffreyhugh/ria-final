import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PRIVATE_SUPABASE_KEY || ''
    );

    const body = req.body;

    // fetch the existing record to confirm the new change is legitimate
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('seedlev', body.seed)
      .limit(1);

    if (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      res.status(500).json({ error });
    } else if (data.length === 0) {
      // no existing record, good to go
      const { error } = await supabase.from('puzzles').insert([
        {
          seedlev: body.seed,
          puzname: body.levelName,
          name: body.username,
          recname: body.username,
          score: body.score,
          when: new Date().toISOString(),
        },
      ]);
      if (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        res.status(500).json({ error });
      } else {
        res.status(200).json({});
      }
      return;
    } else if (data[0].score > body.score) {
      // new record has a lower score, save it
      const { error } = await supabase
        .from('puzzles')
        .update({
          recname: body.username,
          score: body.score,
          when: new Date().toISOString(),
        })
        .eq('seedlev', body.seed);
      if (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        res.status(500).json({ error });
      } else {
        res.status(200).json({});
      }
      return;
    }

    res.status(400).json({ message: 'Invalid score' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
