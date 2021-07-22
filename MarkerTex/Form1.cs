using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace MarkerTex
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (this.folderBrowserDialog1.ShowDialog() == DialogResult.OK)
            {
                this.textBox1.Text = this.folderBrowserDialog1.SelectedPath;
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(this.textBox1.Text))
            {
                return;
            }
            var files = Directory.GetFiles(this.textBox1.Text, "*.jpg");
            var path = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            var processName = Path.Combine(path, "genTexData.exe");
            int i = 0;
            foreach (var item in files)
            {
                try
                {
                    var minDef = (int)this.numericUpDown3.Value;
                    var maxDef = (int)this.numericUpDown4.Value;
                    int? minRes = null;
                    int? maxRes = null;
                    using var process = new Process();

                    process.StartInfo.WorkingDirectory = textBox1.Text;
                    process.StartInfo.FileName = "cmd.exe";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;
                    process.StartInfo.RedirectStandardInput = true;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.EnableRaisingEvents = true;

                    process.OutputDataReceived += (s, e) =>
                    {
                        if (e.Data != null)
                        {
                            Debug.WriteLine(e.Data);
                            //if (e.Data.StartsWith("Select extraction level for tracking features"))
                            //{
                            //    (s as Process).StandardInput.WriteLine(this.numericUpDown1.Value.ToString());
                            //}
                            if (e.Data.StartsWith("Enter the minimum image resolution"))
                            {
                                if (!minRes.HasValue || !maxRes.HasValue)
                                {
                                    var res = Regex.Match(e.Data, @"\[([^,]+),([^,]+)\]");
                                    var min = (int)Math.Ceiling(double.Parse(res.Groups[1].Value));
                                    var max = (int)Math.Floor(double.Parse(res.Groups[2].Value));
                                    if (min < minDef && max > minDef)
                                    {
                                        minRes = minDef;
                                    }
                                    else
                                    {
                                        minRes = min;
                                    }
                                    if (minRes < maxDef && max > maxDef)
                                    {
                                        maxRes = maxDef;
                                    }
                                    else
                                    {
                                        maxRes = max;
                                    }
                                    Debug.WriteLine($"RES:{minDef}-{maxDef},{min}-{max},{minRes}-{maxRes}");
                                }
                            }
                        }
                    };
                    process.ErrorDataReceived += (s, e) =>
                    {
                        if (e.Data != null)
                        {
                            Debug.WriteLine(e.Data);
                        }
                    };
                    process.Exited += (s, e) =>
                    {
                        Debug.WriteLine(e.ToString());
                    };

                    process.Start();
                    process.StandardInput.AutoFlush = true;
                    process.BeginErrorReadLine();
                    process.BeginOutputReadLine();
                    process.StandardInput.WriteLine($"{processName} \"{item}\" && exit");
                    process.StandardInput.WriteLine(this.numericUpDown1.Value.ToString());
                    process.StandardInput.WriteLine(this.numericUpDown2.Value.ToString());
                    process.StandardInput.WriteLine();
                    process.StandardInput.Close();
                    process.WaitForExit();
                    process.CancelErrorRead();
                    process.CancelOutputRead();
                    process.Close();

                    process.Start();
                    process.StandardInput.AutoFlush = true;
                    process.BeginErrorReadLine();
                    process.BeginOutputReadLine();
                    process.StandardInput.WriteLine($"{processName} \"{item}\" && exit");
                    process.StandardInput.WriteLine(this.numericUpDown1.Value.ToString());
                    process.StandardInput.WriteLine(this.numericUpDown2.Value.ToString());
                    process.StandardInput.WriteLine(minRes.Value);
                    process.StandardInput.WriteLine(maxRes.Value);
                    process.StandardInput.Close();
                    process.WaitForExit();
                    process.Close();
                    i++;
                    this.Text = i.ToString();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
            }
            Debug.WriteLine("done");
        }

        private void button3_Click(object sender, EventArgs e)
        {
            var files = Directory.GetFiles(this.textBox1.Text, "*.jpg");
            var i = 1;
            foreach (var item in files)
            {
                var dist = Path.Combine(Path.GetDirectoryName(item), $"{i}.jpg");
                File.Move(item, dist);
                i++;
            }
        }
    }
}