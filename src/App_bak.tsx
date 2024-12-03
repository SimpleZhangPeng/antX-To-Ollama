import { useXAgent, useXChat, Sender, Bubble, XRequest } from '@ant-design/x';
import React from 'react';

const { create } = XRequest({
  baseURL: 'http://localhost:11434/api/generate',
});

const Component: React.FC = () => {
  const [agent] = useXAgent({
    request: async (info, callbacks) => {
      const { messages, message } = info;
      const { onUpdate } = callbacks;

      // current message
      console.log('message', message);
      // messages list
      console.log('messages', messages);

      let content: string = '';

      // messages: [{ role: 'user', content: message }],
      try {
        create(
            {
              model: "qwen2:latest",
              prompt: message,
              stream:true
            },
            {
              onSuccess: (chunks) => {
                console.log('sse chunk list', chunks);
              },
              onError: (error) => {
                console.log('error', error);
              },
              onUpdate: (chunk) => {
                console.log('sse object', chunk);
                var s = JSON.stringify(chunk);
                var parse = JSON.parse(s);
                console.log("----------------->:", parse.response)
                // var parse = JSON.parse(chunk.toString());
                // console.log('parse', parse.response);
                // const data = JSON.parse(chunk.data);
                // content += data?.choices[0].delta.content;
                content += parse.response;
                onUpdate(content);
              },
            },
        );
      } catch (error) {}
    },
  });

  const {
    // use to send message
    onRequest,
    // use to render messages
    messages,
  } = useXChat({ agent });

  const items = messages.map(({ message, id }) => ({
    // key is required, used to identify the message
    key: id,
    content: message,
  }));

  return (
      <div>
        <Bubble.List items={items} />
        <Sender onSubmit={onRequest} />
      </div>
  );
};

export default Component;