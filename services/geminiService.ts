
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Story, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storySchema = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING, description: "Un título corto y enigmático para la historia." },
    intro: { type: Type.STRING, description: "La escena final del suceso. Una frase críptica que se le presentará al jugador al inicio, describiendo el resultado sin explicar la causa. Ejemplo: 'Jack y Judy yacían muertos en el suelo. Había un charco de agua y cristales rotos. ¿Cómo murieron?'" },
    solucion: { type: Type.STRING, description: "La historia completa y lógica que explica el suceso de principio a fin. Esta es la información secreta. Ejemplo: 'Jack y Judy eran dos peces de colores en una pecera. Un gato tiró la pecera de una estantería, esta se rompió en el suelo y los peces murieron.'" }
  },
  required: ["titulo", "intro", "solucion"],
};


export async function generateInitialStoryAndImage(): Promise<Story> {
  const storyPrompt = `Rol: Eres un maestro creador de "Black Stories", experto en tejer misterios intrigantes y macabros que desafían el pensamiento lateral. Tu objetivo es generar nuevas historias para el juego "Black Stories".

Audiencia: Jugadores de "Black Stories" que buscan nuevos enigmas para resolver. El "Guardián del Misterio" leerá la historia completa, mientras que los "Investigadores" solo conocerán el "Enunciado del Misterio".

Instrucciones del Proyecto:
Quiero que crees una nueva historia para el juego "Black Stories". La historia debe ser original, autoconclusiva y seguir la lógica y el estilo característicos del juego. Debe constar de tres partes fundamentales y claramente diferenciadas: un título, el enunciado del misterio (la parte pública) y la solución (la parte secreta para el Guardián del Misterio).

Lógica del Juego que Debes Seguir:
El Guardián del Misterio: Es el único jugador que conoce la solución. Su rol es responder a las preguntas de los demás jugadores.
Los Investigadores: Solo conocen el "Enunciado del Misterio". Deben adivinar lo que ha sucedido haciendo preguntas al Guardián.
Reglas de las Preguntas: Los Investigadores solo pueden hacer preguntas que se puedan responder con un "Sí" o un "No".
Si una pregunta es irrelevante o se basa en una premisa falsa, el Guardián puede responder "No es relevante" o indicar que la premisa es incorrecta.
El objetivo es reconstruir la secuencia de eventos completa a través de la deducción y el pensamiento lateral.

Estructura de la Historia que Debes Generar:

1. Título de la Historia:
Debe ser corto, enigmático y sugerente, como los títulos de las cartas originales de "Black Stories".
Ejemplo: "Música Mortal", "El Último Bocado", "Viaje sin Retorno".
Este será el campo 'titulo' en el JSON.

2. Enunciado del Misterio (Para los Investigadores):
Esta es la única información que reciben los jugadores al principio. Debe ser una descripción breve (1-3 frases) de una situación extraña, macabra o paradójica. Generalmente, implica una muerte o un suceso muy inusual. No debe contener pistas obvias sobre la solución.
Claves para un buen enunciado:
- Intrigante: Debe generar preguntas inmediatamente.
- Conciso: Ve al grano, sin detalles innecesarios.
- Paradójico: A menudo presenta una situación que parece no tener sentido a primera vista.
Ejemplo de enunciado: "Un hombre yace muerto en medio de un campo desierto. A su lado, hay un paquete sin abrir. No hay huellas alrededor, excepto las suyas."
Este será el campo 'intro' en el JSON.

3. Solución (Secreta, para el Guardián del Misterio):
Esta es la explicación completa y detallada de lo que realmente ocurrió. Debe ser lógica, aunque a menudo inesperada y requiera pensar "fuera de la caja". La solución debe conectar todos los elementos presentados en el enunciado y no dejar cabos sueltos.
Claves para una buena solución:
- Completa: Explica el porqué, el cómo, el quién y el qué de la situación.
- Lógica Interna: Aunque sea extraña, la secuencia de eventos debe tener sentido dentro de su propio contexto.
- Resoluble: La solución debe poder deducirse a través de preguntas de "Sí" o "No". No debe depender de conocimientos extremadamente específicos o de detalles imposibles de adivinar.
- Conexión Directa: Debe explicar de forma clara y directa el enigma del enunciado.
Ejemplo de solución (conectado con el ejemplo anterior): "El hombre había decidido saltar desde una avioneta sin paracaídas, esperando aterrizar sobre un enorme fardo de heno que había encargado. El paquete a su lado es el paracaídas que se negó a usar. Murió por el impacto, ya que la empresa de transportes se retrasó y el fardo de heno aún no había sido entregado en el campo."
Este será el campo 'solucion' en el JSON.

Ejemplo Final de Aplicación del Prompt:
Título: El Coleccionista Silencioso
Enunciado del Misterio: Un hombre aparece muerto en una habitación cerrada por dentro, llena de periódicos viejos. La causa de la muerte es asfixia, pero no hay signos de violencia ni nada que obstruyera sus vías respiratorias.
Solución: El hombre sufría un caso extremo de síndrome de Diógenes y era un ávido coleccionista de periódicos. La habitación estaba tan abarrotada de pilas de periódicos que apenas quedaba espacio. Una noche, al entrar en la habitación, accidentalmente derribó una de las pilas más altas, lo que provocó un efecto dominó. Quedó atrapado bajo cientos de kilos de papel, sin poder moverse ni pedir ayuda. Aunque no se asfixió en el sentido tradicional, el inmenso peso de los periódicos sobre su pecho le impidió respirar, causándole la muerte por asfixia por compresión. La puerta estaba cerrada por dentro porque él fue el último en entrar.

¡Ahora, usa este prompt para generar una nueva y emocionante historia de "Black Stories"!

Genera un misterio siguiendo esta estructura y devuelve la respuesta como un objeto JSON con el esquema proporcionado. No agregues ninguna explicación adicional, solo el objeto JSON.`;
  
  const storyResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: storyPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: storySchema,
    },
  });

  const storyJsonText = storyResponse.text.trim();
  const storyData = JSON.parse(storyJsonText) as Omit<Story, 'imageBase64'>;

  const imagePrompt = `Genera una imagen artística, oscura, misteriosa y atmosférica que evoque la sensación de esta escena: "${storyData.intro}". El estilo debe ser sugerente y con un toque noir, como una pintura digital o una ilustración de alto contraste, no una fotografía literal. No reveles detalles cruciales que no estén en la descripción.`;

  const imageResponse = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: imagePrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '16:9',
    },
  });

  const imageBase64 = imageResponse.generatedImages[0].image.imageBytes;

  return {
    ...storyData,
    imageBase64: imageBase64
  };
}

export async function getAnswer(fullStory: string, question: string, chatHistory: ChatMessage[]): Promise<string> {
    const systemInstruction = `Eres el Guardián del Misterio en un juego tipo 'Black Stories'. Tu objetivo es guiar al jugador para que resuelva el misterio.

La solución secreta y completa del misterio es: "${fullStory}"

Tus reglas son las siguientes:
1.  **Responde a las preguntas del jugador basándote estrictamente en la solución secreta.**
2.  **Tus respuestas deben ser principalmente 'Sí' o 'No'.**
3.  **Contexto con moderación:** Si una respuesta de 'Sí' o 'No' puede ser muy confusa, puedes añadir un breve contexto. Por ejemplo, si preguntan "¿Murió por un disparo?" y la solución es un apuñalamiento, en lugar de 'No', podrías decir 'No, no fue un arma de fuego'. Usa esto con moderación.
4.  **Preguntas irrelevantes:** Si una pregunta es irrelevante para resolver el misterio (ej: "¿La víctima era rubia?" cuando el color de pelo no importa), responde de forma creativa que la pregunta es irrelevante, sin decir simplemente "Irrelevante". Por ejemplo: "El color de su pelo se perdió en la oscuridad de los hechos" o "Ese detalle no cambiará el desenlace de la historia".
5.  **Detectar la solución:** Si el jugador propone una solución que es correcta en su esencia, ¡felicítalo! Tu respuesta DEBE empezar con la etiqueta especial [SOLVED]. Por ejemplo: "[SOLVED] ¡Exacto, lo has resuelto!".
6.  **Rendición del jugador:** Si el jugador pide la solución directamente o dice que se rinde, ofrécele una última pista en lugar de la solución. Si insiste una segunda vez, entonces revela la solución, precedida también por la etiqueta [SOLVED].

Revisa el historial de chat para mantener la consistencia.`;
    
    const historyText = chatHistory.map(msg => `${msg.author}: ${msg.text}`).join('\n');
    const fullPrompt = `HISTORIAL DE CHAT:\n${historyText}\n\nPREGUNTA/PROPUESTA ACTUAL DEL JUGADOR:\n${question}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text.trim();
}

export async function getHint(fullStory: string, chatHistory: ChatMessage[]): Promise<string> {
    const historySummary = chatHistory
        .filter(msg => msg.author === 'user')
        .map(msg => `- ${msg.text}`)
        .join('\n');
    
    const systemInstruction = `Eres el Guardián del Misterio. La solución secreta es: "${fullStory}". El jugador ha pedido una pista. 
    
Tu tarea es dar una pista sutil y críptica que lo guíe en la dirección correcta sin revelar elementos clave. La pista debe ser una sola frase enigmática.
    
Un buen ejemplo de pista: Si los personajes son animales pero el jugador cree que son humanos, una buena pista sería: "¿Has considerado la posibilidad de que no sean humanos?".
Un mal ejemplo de pista: "Los personajes son peces".

Analiza las preguntas que ha hecho el jugador hasta ahora y dale una pista útil pero misteriosa.

Aquí están las preguntas que ha hecho el jugador:\n${historySummary}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Dame una pista.", // The prompt itself is simple, the magic is in the system instruction
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text.trim();
}
