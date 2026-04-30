-- =====================================================
-- SEED DATA FOR CANADIAN CITIZENSHIP EXAM PREP APP
-- =====================================================

-- This seed data includes realistic Canadian citizenship exam questions
-- Based on the official study guide "Discover Canada"

-- =====================================================
-- INSERT TOPICS
-- =====================================================
INSERT INTO topics (id, name, description, display_order) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Canadian History', 'Learn about Canada''s rich history from Indigenous peoples to modern times', 1),
    ('22222222-2222-2222-2222-222222222222', 'Government & Politics', 'Understand how Canadian government works at federal, provincial, and municipal levels', 2),
    ('33333333-3333-3333-3333-333333333333', 'Geography', 'Explore Canada''s provinces, territories, and geographic features', 3),
    ('44444444-4444-4444-4444-444444444444', 'Rights & Responsibilities', 'Know your rights and responsibilities as a Canadian citizen', 4),
    ('55555555-5555-5555-5555-555555555555', 'Symbols & Emblems', 'Recognize Canada''s official symbols, flags, and national anthem', 5);

-- Note: For questions, we need a real user ID as created_by
-- In production, you'd replace this with your actual admin user ID
-- For now, we'll create a placeholder admin user

-- Create a test admin user (password: admintest123)
-- You should delete this and create your own admin user in production
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    '$2a$10$XYZ...', -- This is a placeholder; real password hashing happens via Supabase Auth
    NOW(),
    NOW(),
    NOW()
);

-- Create profile for admin user
INSERT INTO profiles (id, email, role, display_name) VALUES
    ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'admin', 'System Admin');

-- =====================================================
-- INSERT QUESTIONS - CANADIAN HISTORY
-- =====================================================

INSERT INTO questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, created_by) VALUES

('11111111-1111-1111-1111-111111111111', 
'When did Canada become a country?',
'1867',
'1776',
'1901',
'1945',
'a',
'Canada became a country on July 1, 1867, when the British North America Act united three colonies into the Dominion of Canada.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'Who are the Indigenous peoples of Canada?',
'First Nations, Métis, and Inuit',
'French and British',
'Vikings and Celts',
'Americans and Mexicans',
'a',
'The Indigenous peoples of Canada include First Nations, Métis, and Inuit peoples who lived here long before European contact.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'Who was the first Prime Minister of Canada?',
'Sir John A. Macdonald',
'Sir Wilfrid Laurier',
'William Lyon Mackenzie King',
'Pierre Trudeau',
'a',
'Sir John A. Macdonald was Canada''s first Prime Minister and one of the Fathers of Confederation.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'What is the War of 1812?',
'A war between the United States and British colonies in Canada',
'A war between Canada and France',
'A civil war in Canada',
'A war between Indigenous peoples',
'a',
'The War of 1812 was fought between the United States and the British Empire (including Canadian colonies). It helped define Canada''s identity.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'In what year did women win the right to vote in federal elections in Canada?',
'1918',
'1867',
'1945',
'1960',
'a',
'Most women gained the right to vote in federal elections in 1918, though some restrictions remained until later.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'Who were the United Empire Loyalists?',
'Americans who remained loyal to Britain during the American Revolution',
'French settlers in Quebec',
'British soldiers in World War I',
'Indigenous peoples who supported the British',
'a',
'United Empire Loyalists were American colonists who remained loyal to the British Crown during the American Revolution and moved to Canada.',
'hard',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'What does D-Day refer to in Canadian history?',
'The Allied invasion of Normandy in World War II',
'Canada''s independence day',
'The day women got the vote',
'Discovery of gold in Yukon',
'a',
'D-Day (June 6, 1944) was the Allied invasion of Normandy, France. Canadian forces played a crucial role in this operation.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'What is the Canadian Pacific Railway?',
'A railway built to unite Canada from coast to coast',
'A subway system in Toronto',
'A ferry service in British Columbia',
'A bridge between Canada and the US',
'a',
'The Canadian Pacific Railway was built in the 1880s to connect Canada from the Atlantic to the Pacific Ocean.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'When did Newfoundland and Labrador join Canada?',
'1949',
'1867',
'1905',
'1999',
'a',
'Newfoundland and Labrador was the last province to join Confederation, in 1949.',
'hard',
'00000000-0000-0000-0000-000000000000'),

('11111111-1111-1111-1111-111111111111',
'What was the Great Depression?',
'A severe economic downturn in the 1930s',
'A mental health crisis in the 1950s',
'A political scandal in the 1970s',
'A natural disaster in the 1920s',
'a',
'The Great Depression was a severe worldwide economic downturn that lasted from 1929 to the late 1930s, severely affecting Canada.',
'easy',
'00000000-0000-0000-0000-000000000000');

-- =====================================================
-- INSERT QUESTIONS - GOVERNMENT & POLITICS
-- =====================================================

INSERT INTO questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, created_by) VALUES

('22222222-2222-2222-2222-222222222222',
'Who is Canada''s Head of State?',
'The Monarch of the United Kingdom',
'The Prime Minister',
'The Governor General',
'The Chief Justice',
'a',
'Canada is a constitutional monarchy. The Monarch (currently King Charles III) is Canada''s Head of State.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'What are the three branches of Canadian government?',
'Executive, Legislative, and Judicial',
'Federal, Provincial, and Municipal',
'Senate, House of Commons, and Supreme Court',
'Parliament, Cabinet, and Bureaucracy',
'a',
'The three branches of government are Executive (implements laws), Legislative (makes laws), and Judicial (interprets laws).',
'medium',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'How many electoral districts (ridings) are there in Canada?',
'338',
'100',
'435',
'500',
'a',
'Canada is divided into 338 federal electoral districts, each represented by a Member of Parliament.',
'hard',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'Who has the right to vote in federal elections?',
'Canadian citizens 18 years or older',
'All residents of Canada',
'Citizens and permanent residents',
'Anyone who pays taxes',
'a',
'Only Canadian citizens who are 18 years of age or older on voting day can vote in federal elections.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'What is a Member of Parliament?',
'An elected representative in the House of Commons',
'An appointed senator',
'A provincial premier',
'A Supreme Court judge',
'a',
'A Member of Parliament (MP) is an elected representative who sits in the House of Commons.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'How are Senators chosen in Canada?',
'They are appointed by the Governor General on advice of the Prime Minister',
'They are elected by the people',
'They are chosen by provincial legislatures',
'They are appointed by the Supreme Court',
'a',
'Senators are appointed by the Governor General on the advice of the Prime Minister.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'What does it mean to have responsible government?',
'The government must have the confidence of elected representatives',
'The government must be responsible with money',
'Politicians must be responsible people',
'The government must respond to all citizen requests',
'a',
'Responsible government means the ministers of the Crown must retain the confidence of the elected House of Commons.',
'hard',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'What is the role of the Governor General?',
'Representative of the Monarch in Canada',
'Head of the military',
'Leader of the Senate',
'Chief Justice of Canada',
'a',
'The Governor General is the representative of the Monarch in Canada and carries out duties on behalf of the Sovereign.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'What is the highest court in Canada?',
'The Supreme Court of Canada',
'The Federal Court',
'The Court of Appeal',
'The Provincial Superior Courts',
'a',
'The Supreme Court of Canada is the highest court and final court of appeal in Canada.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('22222222-2222-2222-2222-222222222222',
'What is a majority government?',
'When one party wins more than half the seats in the House of Commons',
'When most people vote for the winning party',
'When the Prime Minister wins their seat',
'When the Senate approves all bills',
'a',
'A majority government is formed when one party wins more than half (at least 170 out of 338) of the seats in the House of Commons.',
'medium',
'00000000-0000-0000-0000-000000000000');

-- =====================================================
-- INSERT QUESTIONS - GEOGRAPHY
-- =====================================================

INSERT INTO questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, created_by) VALUES

('33333333-3333-3333-3333-333333333333',
'How many provinces and territories does Canada have?',
'10 provinces and 3 territories',
'13 provinces',
'12 provinces and 1 territory',
'9 provinces and 4 territories',
'a',
'Canada has 10 provinces and 3 territories: Yukon, Northwest Territories, and Nunavut.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'What is the capital city of Canada?',
'Ottawa',
'Toronto',
'Montreal',
'Vancouver',
'a',
'Ottawa, located in Ontario, is the capital city of Canada.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'Which province is the largest in land area?',
'Quebec',
'Ontario',
'British Columbia',
'Alberta',
'a',
'Quebec is Canada''s largest province by land area (though Nunavut is the largest territory).',
'medium',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'What are the three oceans that border Canada?',
'Atlantic, Pacific, and Arctic',
'Atlantic, Pacific, and Indian',
'Pacific, Arctic, and Southern',
'Atlantic, Arctic, and Antarctic',
'a',
'Canada is bordered by three oceans: the Atlantic Ocean to the east, the Pacific Ocean to the west, and the Arctic Ocean to the north.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'What is the most populous province in Canada?',
'Ontario',
'Quebec',
'British Columbia',
'Alberta',
'a',
'Ontario is Canada''s most populous province, home to over 14 million people.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'Which mountain range is located in British Columbia and Alberta?',
'The Rocky Mountains',
'The Appalachian Mountains',
'The Laurentian Mountains',
'The Cascade Range',
'a',
'The Rocky Mountains extend through British Columbia and Alberta.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'What is the capital of Nunavut?',
'Iqaluit',
'Yellowknife',
'Whitehorse',
'Inuvik',
'a',
'Iqaluit is the capital and largest community of Nunavut.',
'hard',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'Which Great Lake does NOT border Ontario?',
'Lake Michigan',
'Lake Superior',
'Lake Huron',
'Lake Erie',
'a',
'Lake Michigan is the only Great Lake that does not border Canada; it is entirely within the United States.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'What is Canada''s national capital region?',
'Ottawa and Gatineau',
'Toronto and Mississauga',
'Montreal and Laval',
'Vancouver and Surrey',
'a',
'The National Capital Region includes Ottawa, Ontario and Gatineau, Quebec.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('33333333-3333-3333-3333-333333333333',
'Which province is Canada''s main producer of oil and natural gas?',
'Alberta',
'Saskatchewan',
'Newfoundland and Labrador',
'British Columbia',
'a',
'Alberta is Canada''s largest producer of oil and natural gas.',
'easy',
'00000000-0000-0000-0000-000000000000');

-- =====================================================
-- INSERT QUESTIONS - RIGHTS & RESPONSIBILITIES
-- =====================================================

INSERT INTO questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, created_by) VALUES

('44444444-4444-4444-4444-444444444444',
'What document lists the rights and freedoms of Canadians?',
'The Canadian Charter of Rights and Freedoms',
'The Constitution Act',
'The Bill of Rights',
'The Criminal Code',
'a',
'The Canadian Charter of Rights and Freedoms, part of the Constitution, lists rights and freedoms of Canadians.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'What are some fundamental freedoms protected by the Charter?',
'Freedom of religion, thought, expression, and peaceful assembly',
'Freedom from taxes',
'Freedom to break minor laws',
'Freedom from jury duty',
'a',
'Fundamental freedoms include freedom of conscience and religion, thought, belief, opinion and expression, and peaceful assembly.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'What is the legal requirement for voting in Canada?',
'Being a Canadian citizen 18 or older',
'Being a resident for 5 years',
'Owning property',
'Having a job',
'a',
'To vote in federal elections, you must be a Canadian citizen and at least 18 years old on election day.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'What is one responsibility of Canadian citizenship?',
'Obeying the law',
'Joining the military',
'Attending church',
'Owning property',
'a',
'Responsibilities of citizenship include obeying the law, taking responsibility for oneself and one''s family, and serving on a jury.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'What does equality under the law mean?',
'Everyone has equal protection and benefit of the law',
'Everyone earns the same income',
'Everyone must have the same beliefs',
'Everyone must speak the same language',
'a',
'Equality under the law means every individual is equal before and under the law and has the right to equal protection without discrimination.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'Which of the following is a Canadian citizen required to do?',
'Serve on a jury if called',
'Vote in elections',
'Join a political party',
'Attend town hall meetings',
'a',
'Serving on a jury when called is a legal requirement. Voting is a right and responsibility but not legally required.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'What does freedom of expression allow Canadians to do?',
'Speak freely, write, and express opinions',
'Break the law if they disagree with it',
'Hurt other people with words',
'Ignore other people''s rights',
'a',
'Freedom of expression means you can speak freely, write what you think, and express your opinions, within reasonable limits.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'What is habeas corpus?',
'The right to challenge unlawful detention',
'The right to free healthcare',
'The right to a lawyer',
'The right to silence',
'a',
'Habeas corpus is the right to challenge unlawful detention by the state and is a key protection of individual freedom.',
'hard',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'Which rights are protected by mobility rights in the Charter?',
'Right to live and work anywhere in Canada',
'Right to free transportation',
'Right to a driver''s license',
'Right to travel abroad',
'a',
'Mobility rights protect the right of citizens to live, work, and move anywhere in Canada.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('44444444-4444-4444-4444-444444444444',
'What does presumption of innocence mean?',
'You are innocent until proven guilty',
'You are guilty until proven innocent',
'Police must prove you are innocent',
'Judges decide guilt before trial',
'a',
'The presumption of innocence means everyone is considered innocent until proven guilty in a court of law.',
'easy',
'00000000-0000-0000-0000-000000000000');

-- =====================================================
-- INSERT QUESTIONS - SYMBOLS & EMBLEMS
-- =====================================================

INSERT INTO questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, created_by) VALUES

('55555555-5555-5555-5555-555555555555',
'What is Canada''s national animal?',
'The beaver',
'The moose',
'The polar bear',
'The Canada goose',
'a',
'The beaver is Canada''s official national animal, symbolizing the importance of the fur trade in Canadian history.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'What is the official summer sport of Canada?',
'Lacrosse',
'Hockey',
'Baseball',
'Soccer',
'a',
'Lacrosse is Canada''s official summer sport, while ice hockey is the official winter sport.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'What is the national motto of Canada?',
'A Mari Usque Ad Mare (From Sea to Sea)',
'In God We Trust',
'Liberty and Justice',
'Unity and Strength',
'a',
'Canada''s motto is "A Mari Usque Ad Mare" which is Latin for "From Sea to Sea," referencing Canada''s geography.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'What leaf is on the Canadian flag?',
'Maple leaf',
'Oak leaf',
'Birch leaf',
'Pine needle',
'a',
'The red maple leaf is the centerpiece of Canada''s flag and is a widely recognized Canadian symbol.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'When was the current Canadian flag adopted?',
'1965',
'1867',
'1945',
'1982',
'a',
'The current Canadian flag with the red maple leaf was officially adopted on February 15, 1965.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'What are Canada''s official colors?',
'Red and white',
'Red and blue',
'Blue and white',
'Red, white, and blue',
'a',
'Red and white were proclaimed Canada''s official colors in 1921 by King George V.',
'easy',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'What is the tower in the centre of Parliament Buildings called?',
'The Peace Tower',
'The Victory Tower',
'The Crown Tower',
'The Liberty Tower',
'a',
'The Peace Tower stands in the centre of the Parliament Buildings in Ottawa.',
'medium',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'What flowers are on the provincial flag of Quebec?',
'Fleur-de-lys (lily)',
'Rose',
'Tulip',
'Maple flower',
'a',
'The Quebec flag features four white fleur-de-lys (lilies) on a blue background.',
'hard',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'What is the Royal Anthem of Canada?',
'God Save the King/Queen',
'O Canada',
'The Maple Leaf Forever',
'Canada, We Stand on Guard',
'a',
'"God Save the King" (or "God Save the Queen") is the Royal Anthem, while "O Canada" is the national anthem.',
'hard',
'00000000-0000-0000-0000-000000000000'),

('55555555-5555-5555-5555-555555555555',
'What does the Crown symbolize in Canada?',
'Government authority and democracy',
'British colonization',
'Religious power',
'Military strength',
'a',
'The Crown symbolizes government authority, including Parliament, legislatures, courts, police, and the armed forces.',
'medium',
'00000000-0000-0000-0000-000000000000');

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total: 50 questions
-- - Canadian History: 10 questions
-- - Government & Politics: 10 questions
-- - Geography: 10 questions
-- - Rights & Responsibilities: 10 questions
-- - Symbols & Emblems: 10 questions
--
-- Difficulty distribution:
-- - Easy: ~20 questions
-- - Medium: ~20 questions
-- - Hard: ~10 questions
-- =====================================================
